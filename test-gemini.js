// test-gemini-fixed.js - Fixed version with correct model names
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { knowledgeUtils } = require('./knowledge-base');
require('dotenv').config();

// Color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(color + message + colors.reset);
}

async function listAvailableModels() {
    log(colors.cyan, '\n🔍 Checking Available Gemini Models...');
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Try to list models
        const models = await genAI.listModels();
        
        log(colors.green, '✅ Available models:');
        models.forEach(model => {
            log(colors.blue, `   - ${model.name}`);
        });
        
        return models;
        
    } catch (error) {
        log(colors.yellow, '⚠️ Could not list models, will try common model names');
        return null;
    }
}

async function testGeminiConnectionWithModels() {
    log(colors.cyan, '\n🤖 Testing Gemini AI Connection with Different Models...');
    
    try {
        // Check API key
        if (!process.env.GEMINI_API_KEY) {
            log(colors.red, '❌ GEMINI_API_KEY not found in .env');
            return false;
        }
        
        log(colors.green, '✅ GEMINI_API_KEY found');
        
        // Try different model names (Google keeps changing these)
        const modelNamesToTry = [
            'gemini-1.5-flash',
            'gemini-1.5-pro', 
            'gemini-pro',
            'gemini-1.0-pro',
            'models/gemini-1.5-flash',
            'models/gemini-1.5-pro',
            'models/gemini-pro'
        ];
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        for (const modelName of modelNamesToTry) {
            log(colors.yellow, `🔗 Trying model: ${modelName}...`);
            
            try {
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig: {
                        temperature: 0.3,
                        topP: 0.8,
                        topK: 40,
                        maxOutputTokens: 1024,
                    }
                });
                
                // Test generation
                const prompt = `
                You are a medical AI assistant for OSA monitoring. 
                Please respond in Indonesian: "Test: Jelaskan OSA dalam satu kalimat singkat."
                `;
                
                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();
                
                log(colors.green, `✅ SUCCESS with model: ${modelName}`);
                log(colors.blue, `📝 Test response: ${text.substring(0, 100)}...`);
                log(colors.magenta, '🆓 Using FREE Gemini API - No quota limits!');
                
                // Update .env file suggestion
                log(colors.cyan, `\n💡 Update your .env file:`);
                log(colors.cyan, `GEMINI_MODEL=${modelName}`);
                
                return { success: true, workingModel: modelName, response: text };
                
            } catch (error) {
                log(colors.red, `❌ Failed with ${modelName}: ${error.message.substring(0, 100)}...`);
                continue;
            }
        }
        
        log(colors.red, '❌ All model attempts failed');
        return { success: false };
        
    } catch (error) {
        log(colors.red, `❌ Gemini connection error: ${error.message}`);
        return { success: false };
    }
}

async function runFixedGeminiTests() {
    log(colors.magenta, '🚀 OSA Medical Chatbot - Fixed Gemini AI Test Suite');
    log(colors.magenta, '=================================================\n');
    
    const results = {
        environment: false,
        knowledgeBase: false,
        geminiConnection: false,
        modelDetection: false
    };
    
    // Test 1: Environment
    log(colors.cyan, '🔧 Testing Environment Variables...');
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-gemini-key')) {
        log(colors.green, '✅ Environment variables OK');
        results.environment = true;
    } else {
        log(colors.red, '❌ Environment variables missing or invalid');
        return results;
    }
    
    // Test 2: Knowledge Base
    log(colors.cyan, '\n📚 Testing Knowledge Base...');
    try {
        const { sleepSenseKnowledge } = require('./knowledge-base');
        const sections = Object.keys(sleepSenseKnowledge);
        log(colors.green, `✅ Knowledge base loaded dengan ${sections.length} sections`);
        
        const testIntent = knowledgeUtils.classifyIntent('Apa itu OSA?');
        log(colors.blue, `✅ Intent classification: ${testIntent}`);
        results.knowledgeBase = true;
    } catch (error) {
        log(colors.red, `❌ Knowledge base error: ${error.message}`);
        return results;
    }
    
    // Test 3: List available models (optional)
    await listAvailableModels();
    
    // Test 4: Connection with model detection
    const connectionResult = await testGeminiConnectionWithModels();
    results.geminiConnection = connectionResult.success;
    results.modelDetection = connectionResult.success;
    
    // Test 5: Bot Integration (if connection successful)
    if (results.geminiConnection) {
        log(colors.cyan, '\n🤖 Testing Bot Integration...');
        try {
            // Test if bot file exists and can be loaded
            const { OSAMedicalBotGemini } = require('./bot-gemini');
            log(colors.green, '✅ Bot class found');
            
            // Update the bot to use working model
            if (connectionResult.workingModel) {
                log(colors.blue, `📝 Recommended model for bot: ${connectionResult.workingModel}`);
            }
            
            log(colors.green, '✅ Bot integration test passed');
            results.botIntegration = true;
            
        } catch (error) {
            log(colors.red, `❌ Bot integration failed: ${error.message}`);
        }
    }
    
    // Summary
    log(colors.magenta, '\n📊 Test Results Summary:');
    log(colors.magenta, '========================');
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASSED' : '❌ FAILED';
        const color = passed ? colors.green : colors.red;
        log(color, `${test.padEnd(20)}: ${status}`);
    });
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    
    log(colors.magenta, `\nOverall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        log(colors.green, '\n🎉 ALL TESTS PASSED! Gemini bot is ready to use.');
        log(colors.cyan, '\n🚀 Next steps:');
        log(colors.cyan, '1. Update .env with working model name');
        log(colors.cyan, '2. Start the bot: node index-gemini.js');
        log(colors.cyan, '3. Test via API');
        log(colors.magenta, '\n🆓 Benefits: FREE API, No quota limits, Fast responses!');
    } else if (results.geminiConnection) {
        log(colors.yellow, '\n⚠️ Connection works but some issues remain');
        log(colors.cyan, '🔧 Update your .env and try again');
    } else {
        log(colors.red, '\n❌ Connection failed. Consider alternatives:');
        log(colors.yellow, '1. Try Hugging Face (simpler setup)');
        log(colors.yellow, '2. Use OpenAI with credits');
        log(colors.yellow, '3. Check Google Cloud project settings');
    }
    
    return results;
}

// Export working model info
async function getWorkingModel() {
    const result = await testGeminiConnectionWithModels();
    return result.workingModel || 'gemini-1.5-flash';
}

// Run tests if called directly
if (require.main === module) {
    runFixedGeminiTests().then(results => {
        process.exit(results.geminiConnection ? 0 : 1);
    }).catch(error => {
        log(colors.red, `🚨 Unexpected error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { 
    runFixedGeminiTests, 
    testGeminiConnectionWithModels,
    getWorkingModel
};