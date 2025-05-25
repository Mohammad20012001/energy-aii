import { CodeGPTPlus } from 'judini';

// إنشاء مثيل من CodeGPTPlus
const codegpt = new CodeGPTPlus({ apiKey: 'sk-4a2f33b7-f462-46fe-af64-91503e7fd052' });

// وحدة التحكم في الدردشة
export const chatController = async (req, res) => {
    try {
        const userMessage = req.body.messages?.[0]?.content || '';
        const model = req.body.model || 'gpt-4o';
        const temperature = req.body.temperature || 0.7;
        const maxTokens = req.body.max_tokens || 150;
        
        // سجل الرسالة للتصحيح
        console.log(`Received message: "${userMessage}"`);
        console.log(`Using model: ${model}, temp: ${temperature}, maxTokens: ${maxTokens}`);
        
        const msg = [{ role: 'user', content: userMessage }];
        
        const aiRes = await codegpt.chatCompletion({
            messages: msg,
            agentId: process.env.AGENT_ID || 'YOUR_AGENT_ID',
            temperature: temperature,
            maxTokens: maxTokens
        });
        
        console.log('AI response received');
        res.json(aiRes);
    } catch (error) {
        console.error('Error in AI chat:', error);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء معالجة طلبك',
            choices: [
                {
                    message: {
                        content: "عذراً، حدث خطأ في الذكاء الاصطناعي. يرجى المحاولة مرة أخرى."
                    }
                }
            ]
        });
    }
};

// وحدة التحكم في حفظ المحادثات
export const saveConversationController = async (req, res) => {
    try {
        const { userId, messages } = req.body;
        
        if (!userId || !messages || !Array.isArray(messages)) {
            return res.status(400).json({
                status: 'error',
                message: 'بيانات غير صالحة. يرجى توفير معرف المستخدم والرسائل.'
            });
        }
        
        // هنا يمكن إضافة كود لحفظ المحادثة في قاعدة البيانات
        console.log(`Saving conversation for user: ${userId}`);
        // مثال: await database.saveConversation(userId, messages);
        
        res.json({
            status: 'success',
            message: 'تم حفظ المحادثة بنجاح'
        });
    } catch (error) {
        console.error('Error saving conversation:', error);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء حفظ المحادثة'
        });
    }
};

// وحدة التحكم في استرجاع المحادثات
export const getConversationsController = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                status: 'error',
                message: 'معرف المستخدم مطلوب'
            });
        }
        
        console.log(`Fetching conversations for user: ${userId}`);
        // هنا يمكن إضافة كود لاسترجاع محادثات المستخدم من قاعدة البيانات
        // مثال: const conversations = await database.getConversations(userId);
        
        // بيانات تجريبية للاختبار
        const conversations = [
            {
                id: '1',
                timestamp: new Date().toISOString(),
                messages: [
                    { role: 'user', content: 'مرحبا' },
                    { role: 'bot', content: 'مرحبا بك! كيف يمكنني مساعدتك اليوم؟' }
                ]
            }
        ];
        
        res.json({
            status: 'success',
            data: conversations
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء استرجاع المحادثات'
        });
    }
};

// وحدة التحكم في نموذج الاتصال
export const contactController = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'جميع الحقول مطلوبة'
            });
        }
        
        console.log(`Contact form submission from: ${name} (${email})`);
        // هنا يمكن إضافة كود لحفظ بيانات الاتصال في قاعدة البيانات
        // مثال: await database.saveContactForm({ name, email, message });
        
        res.json({
            status: 'success',
            message: 'تم إرسال رسالتك بنجاح'
        });
    } catch (error) {
        console.error('Error saving contact form:', error);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء إرسال النموذج'
        });
    }
};

// وحدة التحكم في التسجيل
export const registerController = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({
                status: 'error',
                message: 'جميع الحقول مطلوبة'
            });
        }
        
        console.log(`New user registration: ${name} (${email})`);
        // هنا يمكن إضافة كود للتحقق من البريد الإلكتروني وتسجيل المستخدم
        // مثال: await database.registerUser({ email, password, name });
        
        res.json({
            status: 'success',
            message: 'تم التسجيل بنجاح'
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء التسجيل'
        });
    }
};

// وحدة التحكم في تسجيل الدخول
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'البريد الإلكتروني وكلمة المرور مطلوبان'
            });
        }
        
        console.log(`Login attempt for: ${email}`);
        // هنا يمكن إضافة كود للتحقق من بيانات المستخدم
        // مثال: const user = await database.authenticateUser(email, password);
        
        // بيانات تجريبية للاختبار
        const user = {
            id: '123',
            name: 'مستخدم تجريبي',
            email: email
        };
        
        res.json({
            status: 'success',
            message: 'تم تسجيل الدخول بنجاح',
            data: {
                user: user,
                token: 'token_تجريبي_للاختبار'
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء تسجيل الدخول'
        });
    }
};
