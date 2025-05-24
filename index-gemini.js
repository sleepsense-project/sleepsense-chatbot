// index-gemini.js - Fixed version for OSA Medical Chatbot
const express = require('express');
const path = require('path'); // Added missing import
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');
const { OSAMedicalBotGemini } = require('./bot-gemini');
require('dotenv').config();

// Validate environment variables for Gemini
const requiredEnvVars = ['GEMINI_API_KEY'];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        console.log('🔑 Get your free Gemini API key from: https://aistudio.google.com/app/apikey');
        process.exit(1);
    }
}

console.log('✅ Environment variables validated');

const app = express();
app.use(express.json());

// Create Bot Framework Adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Error handler
adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    await context.sendActivity('❌ Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi support.');
    console.error('Error details:', error);
};

// Create conversation state
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create the main bot
const bot = new OSAMedicalBotGemini();

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Serve static files (moved to correct position)
app.use(express.static(path.join(__dirname, 'public')));

// Web interface route (moved to correct position)
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'chatbot.html'));
});

// Alternative route for web interface
app.get('/web', (req, res) => {
    res.sendFile(path.join(__dirname, 'chatbot.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'OSA Medical Chatbot (Gemini AI)',
        timestamp: new Date().toISOString(),
        apiProvider: 'gemini',
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash', // Updated default model
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'SleepSense OSA Medical Chatbot',
        description: 'AI-powered medical assistant untuk OSA monitoring system',
        apiProvider: 'Google Gemini (FREE)',
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        endpoints: {
            health: '/health',
            chat: '/chat',
            web: '/web',
            bot: '/api/messages',
            knowledge: '/api/knowledge',
            test: '/api/chat/test',
            docs: '/api/docs'
        },
        features: [
            'OSA medical education',
            'SleepSense device support',
            'Troubleshooting assistance',
            'Data interpretation guidance',
            'FREE Gemini AI integration',
            'Web chat interface'
        ],
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// Knowledge base endpoint
app.get('/api/knowledge', (req, res) => {
    try {
        const { sleepSenseKnowledge } = require('./knowledge-base');
        res.json({
            sections: Object.keys(sleepSenseKnowledge),
            totalSections: Object.keys(sleepSenseKnowledge).length,
            description: 'SleepSense research paper knowledge base',
            sampleSections: {
                medical: Object.keys(sleepSenseKnowledge.medical),
                technology: Object.keys(sleepSenseKnowledge.technology),
                clinical: Object.keys(sleepSenseKnowledge.clinical),
                device: Object.keys(sleepSenseKnowledge.device),
                safety: Object.keys(sleepSenseKnowledge.safety)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error loading knowledge base:', error);
        res.status(500).json({ 
            error: 'Knowledge base not available',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        title: 'OSA Medical Chatbot API Documentation',
        version: '1.0.0',
        description: 'AI-powered medical assistant untuk OSA monitoring dengan SleepSense technology',
        baseUrl: `${req.protocol}://${req.get('host')}`,
        endpoints: {
            'GET /': 'Service information dan available endpoints',
            'GET /health': 'Health check dengan system metrics',
            'GET /chat': 'Web interface untuk chatbot',
            'GET /api/knowledge': 'Knowledge base information dari research paper',
            'POST /api/messages': 'Bot Framework endpoint untuk production',
            'POST /api/chat/test': 'Test endpoint untuk single chat',
            'GET /api/docs': 'API documentation (this endpoint)'
        },
        testExamples: {
            healthCheck: {
                url: '/health',
                method: 'GET',
                description: 'Check service health dan configuration'
            },
            chat: {
                url: '/api/chat/test',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    message: "Apa itu OSA dan bagaimana SleepSense membantu?",
                    userId: "test-user"
                },
                description: 'Send message to medical chatbot'
            }
        },
        sampleQueries: [
            "Apa itu OSA dan bagaimana dampaknya pada kesehatan?",
            "Jelaskan teknologi SleepSense dan akurasinya",
            "Bagaimana cara setup device SleepSense di rumah?",
            "Device saya tidak merespons, bagaimana troubleshoot?",
            "AHI saya 25, apa artinya dan kapan harus ke dokter?",
            "Apa perbedaan SleepSense dengan PSG tradisional?",
            "Tips untuk tidur yang lebih baik dan mencegah OSA?"
        ],
        medicalDisclaimer: "Informasi yang diberikan adalah untuk edukasi. SleepSense adalah alat screening - konsultasi dokter spesialis untuk diagnosis dan terapi definitif.",
        timestamp: new Date().toISOString()
    });
});

// Main bot endpoint untuk Bot Framework
app.post('/api/messages', async (req, res) => {
    try {
        await adapter.processActivity(req, res, async (context) => {
            await bot.run(context);
        });
    } catch (error) {
        console.error('Error processing Bot Framework activity:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test endpoint untuk direct chat
app.post('/api/chat/test', async (req, res) => {
    try {
        const { message, userId = 'test-user' } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                success: false,
                error: 'Message is required',
                example: {
                    message: "Apa itu OSA?",
                    userId: "test-user"
                },
                timestamp: new Date().toISOString()
            });
        }
        
        console.log(`📨 Chat request from ${userId}: ${message.substring(0, 50)}...`);
        
        // Create mock context untuk testing
        const mockContext = {
            activity: {
                text: message,
                from: { id: userId },
                recipient: { id: 'bot' },
                type: 'message'
            },
            sendActivity: async (activity) => {
                return { id: 'test-activity-id' };
            }
        };
        
        const startTime = Date.now();
        const response = await bot.processOSAQuery(message, userId, mockContext);
        const responseTime = Date.now() - startTime;
        
        console.log(`✅ Response generated in ${responseTime}ms (${response.length} chars)`);
        
        res.json({
            success: true,
            response: response,
            timestamp: new Date().toISOString(),
            userId: userId,
            apiProvider: 'gemini',
            model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
            messageLength: response.length,
            responseTimeMs: responseTime
        });
        
    } catch (error) {
        console.error('❌ Error in test chat:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
            help: 'Check your Gemini API key and internet connection',
            troubleshooting: {
                apiKey: process.env.GEMINI_API_KEY ? 'Present' : 'Missing',
                model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
            }
        });
    }
});

// Batch test endpoint untuk multiple queries
app.post('/api/chat/batch-test', async (req, res) => {
    try {
        const { messages, userId = 'batch-test-user' } = req.body;
        
        if (!Array.isArray(messages)) {
            return res.status(400).json({ 
                error: 'Messages should be an array',
                example: {
                    messages: ["Apa itu OSA?", "Bagaimana setup SleepSense?"],
                    userId: "test-user"
                }
            });
        }
        
        const results = [];
        const startTime = Date.now();
        
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            console.log(`🔄 Batch test ${i + 1}/${messages.length}: ${message.substring(0, 30)}...`);
            
            try {
                const mockContext = {
                    activity: {
                        text: message,
                        from: { id: `${userId}-${i}` },
                        recipient: { id: 'bot' }
                    },
                    sendActivity: async (activity) => ({ id: `test-${i}` })
                };
                
                const response = await bot.processOSAQuery(message, `${userId}-${i}`, mockContext);
                
                results.push({
                    query: message,
                    response: response,
                    success: true,
                    timestamp: new Date().toISOString(),
                    responseLength: response.length
                });
                
            } catch (error) {
                results.push({
                    query: message,
                    response: null,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        const totalTime = Date.now() - startTime;
        
        res.json({
            success: true,
            totalQueries: messages.length,
            successfulQueries: results.filter(r => r.success).length,
            totalTimeMs: totalTime,
            averageTimeMs: Math.round(totalTime / messages.length),
            results: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error in batch test:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /',
            'GET /health',
            'GET /chat',
            'GET /api/knowledge',
            'GET /api/docs',
            'POST /api/chat/test'
        ],
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log(`
🚀 OSA Medical Chatbot Server Started! (Gemini AI)
    
📍 Server: http://localhost:${PORT}
🌐 Web Chat: http://localhost:${PORT}/chat
🔗 Bot Endpoint: http://localhost:${PORT}/api/messages
🏥 Health Check: http://localhost:${PORT}/health
🧪 Test Chat: http://localhost:${PORT}/api/chat/test
📚 Knowledge Base: http://localhost:${PORT}/api/knowledge
📖 API Docs: http://localhost:${PORT}/api/docs

🔧 Configuration:
- Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Connected' : '❌ Not configured'}
- Model: ${process.env.GEMINI_MODEL || 'gemini-1.5-flash'}
- Bot Framework: ${process.env.MICROSOFT_APP_ID ? '✅ Configured' : '⚠️  Development mode'}
- Node.js: ${process.version}
- Environment: ${process.env.NODE_ENV || 'development'}

📚 Knowledge Base: SleepSense OSA Research Paper loaded
🤖 Ready to help with OSA monitoring and SleepSense device support!
🆓 FREE Gemini AI - No quota limitations!

🧪 Quick Tests:
• Web Interface: http://localhost:${PORT}/chat
• Health Check: curl http://localhost:${PORT}/health
• API Test: curl -X POST http://localhost:${PORT}/api/chat/test -H "Content-Type: application/json" -d '{"message": "Halo!"}'
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down OSA Medical Chatbot...');
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = app;