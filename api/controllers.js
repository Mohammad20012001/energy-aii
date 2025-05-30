import { contactController as contactHandler } from './controllers/contactController.js';
import { loginUser, registerUser } from './controllers/authController.js';
import { chatController as chatHandler } from './controllers/chatController.js';

// تصدير وحدات التحكم للحفاظ على التوافق مع الكود القديم
export const chatController = chatHandler;
export const contactController = contactHandler;
export const loginController = loginUser;
export const registerController = registerUser;
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
