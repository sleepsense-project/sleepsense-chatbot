const { ActivityHandler, MessageFactory } = require('botbuilder');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { sleepSenseKnowledge, knowledgeUtils } = require('./knowledge-base');

/**
 * OSA Medical Bot menggunakan Google Gemini API (FREE)
 * Specialized untuk SleepSense OSA monitoring system
 */
class OSAMedicalBotGemini extends ActivityHandler {
    constructor() {
        super();
        
        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = genAI.getGenerativeModel({ 
            model: process.env.GEMINI_MODEL || 'gemini-pro',
            generationConfig: {
                temperature: 0.3,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 1024,
            }
        });
        
        this.conversationHistory = new Map();
        
        // Handle incoming messages
        this.onMessage(async (context, next) => {
            const userMessage = context.activity.text;
            const userId = context.activity.from.id;
            
            try {
                console.log(`Received message from ${userId}: ${userMessage}`);
                
                const response = await this.processOSAQuery(userMessage, userId, context);
                await context.sendActivity(MessageFactory.text(response));
                
            } catch (error) {
                console.error('Error processing message:', error);
                await context.sendActivity(MessageFactory.text(this.getErrorResponse()));
            }
            
            await next();
        });
        
        // Welcome new users
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            
            for (let member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(this.getWelcomeMessage()));
                }
            }
            
            await next();
        });
        
        console.log('✅ OSA Medical Bot (Gemini AI) initialized successfully!');
    }
    
    /**
     * Process OSA-related queries dengan Gemini AI
     */
    async processOSAQuery(userMessage, userId, context) {
        try {
            // Classify intent
            const intent = knowledgeUtils.classifyIntent(userMessage);
            console.log(`Intent classified: ${intent}`);
            
            // Get relevant knowledge
            const relevantSections = knowledgeUtils.findRelevantKnowledge(userMessage);
            const knowledgeContext = knowledgeUtils.generateContext(relevantSections);
            
            // Build conversation history
            this.updateConversationHistory(userId, userMessage);
            const conversationContext = this.getConversationContext(userId);
            
            // Create comprehensive prompt for Gemini
            const prompt = this.buildGeminiPrompt(knowledgeContext, conversationContext, userMessage, intent);
            
            console.log('Sending request to Gemini AI...');
            
            // Call Gemini AI
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            let text = response.text();
            
            // Post-process response
            text = this.enhanceResponse(text, intent, relevantSections);
            
            // Update conversation history
            this.updateConversationHistory(userId, text, 'assistant');
            
            // Log for analytics
            this.logConversation(userId, userMessage, text, intent);
            
            return text;
            
        } catch (error) {
            console.error('Error in processOSAQuery:', error);
            throw error;
        }
    }
    
    /**
     * Build comprehensive prompt untuk Gemini AI
     */
    buildGeminiPrompt(knowledgeContext, conversationContext, userMessage, intent) {
        return `
Anda adalah AI medical assistant khusus untuk sistem OSA (Obstructive Sleep Apnea) monitoring SleepSense.

KNOWLEDGE BASE dari Research Paper SleepSense:
${knowledgeContext}

CONVERSATION CONTEXT:
${conversationContext}

CURRENT USER QUESTION: ${userMessage}
DETECTED INTENT: ${intent}

PERAN DAN TANGGUNG JAWAB:
1. Berikan informasi medis yang akurat berdasarkan research paper SleepSense
2. Bantu troubleshooting device SleepSense (ESP32, sensors, IoT)
3. Berikan interpretasi dasar data monitoring (NON-DIAGNOSTIK)
4. Edukasi tentang OSA, sleep hygiene, dan teknologi monitoring
5. Guide users kapan harus konsultasi dokter spesialis

BATASAN KETAT:
- TIDAK memberikan diagnosis medis personal
- TIDAK merekomendasikan terapi tanpa konsultasi dokter
- TIDAK menginterpretasi hasil monitoring sebagai diagnosis final
- SELALU tekankan bahwa SleepSense adalah alat screening, bukan pengganti dokter
- Gunakan bahasa Indonesia yang mudah dipahami namun tetap akurat secara medis

GAYA KOMUNIKASI:
- Profesional namun ramah dan empati
- Gunakan emoji yang tepat untuk clarity
- Berikan informasi step-by-step jika diperlukan
- Maksimal 500 kata per response
- Selalu sertakan medical disclaimer untuk medical queries

FOKUS KHUSUS berdasarkan intent "${intent}":
${this.getIntentSpecificGuidance(intent)}

Jawab pertanyaan user berdasarkan knowledge base dan context yang diberikan.
        `;
    }
    
    /**
     * Get intent-specific guidance
     */
    getIntentSpecificGuidance(intent) {
        switch(intent) {
            case 'device_troubleshooting':
                return 'Berikan troubleshooting teknis yang clear dan actionable untuk device SleepSense. Include step-by-step solutions.';
            
            case 'medical_education':
                return 'Berikan edukasi medis yang comprehensive tentang OSA berdasarkan research findings. Include statistics dan health impacts.';
            
            case 'medical_guidance':
                return 'Berikan guidance medical yang safe, dan SELALU direct ke konsultasi dokter untuk diagnosis/terapi definitif.';
            
            case 'technology_info':
                return 'Jelaskan teknologi SleepSense, AI model, sensor specifications, dan akurasi dengan detail teknis.';
            
            case 'device_setup':
                return 'Berikan panduan setup yang clear dan step-by-step untuk device SleepSense.';
            
            default:
                return 'Berikan response yang helpful dan relevan dengan konteks OSA dan SleepSense.';
        }
    }
    
    /**
     * Enhance response dengan additional context
     */
    enhanceResponse(response, intent, relevantSections) {
        let enhanced = response;
        
        // Add medical disclaimer untuk medical queries
        if (['medical_education', 'medical_guidance'].includes(intent)) {
            enhanced += `\n\n⚠️ **Disclaimer Medis**: Informasi ini untuk edukasi. SleepSense adalah alat screening - konsultasi dokter spesialis untuk diagnosis dan terapi yang tepat.`;
        }
        
        // Add technical support contact untuk device issues
        if (['device_troubleshooting', 'device_setup'].includes(intent)) {
            enhanced += `\n\n🔧 **Technical Support**: Jika masalah berlanjut, dokumentasikan error dan hubungi technical support SleepSense.`;
        }
        
        // Add research reference jika ada
        if (relevantSections.length > 0) {
            enhanced += `\n\n📚 **Referensi**: Informasi berdasarkan research paper "SleepSense: Inovasi Diagnosis OSA Berbasis AI dan IoT"`;
        }
        
        return enhanced;
    }
    
    /**
     * Manage conversation history untuk context
     */
    updateConversationHistory(userId, message, role = 'user') {
        if (!this.conversationHistory.has(userId)) {
            this.conversationHistory.set(userId, []);
        }
        
        const history = this.conversationHistory.get(userId);
        history.push({ role, message, timestamp: new Date() });
        
        // Keep only last 6 exchanges untuk avoid token limits
        if (history.length > 12) {
            history.splice(0, history.length - 12);
        }
        
        this.conversationHistory.set(userId, history);
    }
    
    /**
     * Get conversation context untuk continuity
     */
    getConversationContext(userId) {
        const history = this.conversationHistory.get(userId) || [];
        
        if (history.length === 0) {
            return "This is the start of our conversation about OSA and SleepSense.";
        }
        
        const recentHistory = history.slice(-4); // Last 2 exchanges
        return recentHistory
            .map(h => `${h.role}: ${h.message.substring(0, 150)}`)
            .join('\n');
    }
    
    /**
     * Welcome message untuk new users
     */
    getWelcomeMessage() {
        return `
👋 **Selamat datang di OSA Medical Assistant!**

Saya adalah AI assistant khusus untuk sistem monitoring OSA SleepSense, powered by Google Gemini AI.

🔬 **Informasi Medis OSA**
- Penjelasan tentang Obstructive Sleep Apnea
- Statistik prevalensi dan dampak kesehatan
- Risk factors dan gejala OSA

🔧 **Panduan Device SleepSense**
- Setup dan instalasi device IoT
- Troubleshooting sensor dan konektivitas
- Maintenance dan calibration

📊 **Monitoring & Data**
- Interpretasi dasar hasil monitoring
- Penjelasan AHI classification
- Kapan harus konsultasi dokter

💡 **Tips & Lifestyle**
- Sleep hygiene recommendations
- Lifestyle modifications untuk OSA

**Contoh pertanyaan:**
• "Apa itu OSA dan bagaimana SleepSense membantu?"
• "Bagaimana cara setup device SleepSense?"
• "AHI saya 20, apa artinya?"
• "Device saya error, bagaimana troubleshoot?"

Silakan tanya apa saja tentang OSA atau SleepSense! 😊
        `;
    }
    
    /**
     * Error response
     */
    getErrorResponse() {
        return `
😔 Maaf, terjadi kesalahan teknis sementara dengan Gemini AI. Silakan coba lagi dalam beberapa saat.

🔧 **Troubleshooting:**
- Pastikan koneksi internet stabil
- Coba restart aplikasi
- Hubungi support jika masalah berlanjut

📞 **Penting**: Jika Anda mengalami gejala OSA yang serius (sesak napas parah, nyeri dada), segera konsultasi dokter atau layanan gawat darurat!

Saya siap membantu lagi setelah masalah teknis ini teratasi. 🙏
        `;
    }
    
    /**
     * Log conversation untuk analytics
     */
    logConversation(userId, userMessage, botResponse, intent) {
        const logData = {
            timestamp: new Date().toISOString(),
            userId: userId,
            intent: intent,
            userMessage: userMessage.substring(0, 100), // Truncate for privacy
            responseLength: botResponse.length,
            success: true,
            apiProvider: 'gemini'
        };
        
        console.log('Conversation logged:', JSON.stringify(logData, null, 2));
    }
}

module.exports.OSAMedicalBotGemini = OSAMedicalBotGemini;