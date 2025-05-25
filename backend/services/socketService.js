const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const aiService = require('./aiService');
const calculationService = require('./calculationService');

/**
 * Initialize Socket.IO service
 * @param {Object} io - Socket.IO instance
 */
module.exports = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);
    
    // Join user's room
    socket.join(socket.user._id.toString());
    
    // Handle chat message
    socket.on('chat_message', async (data) => {
      try {
        const { chatId, message } = data;
        
        // Find chat
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        // Check if user owns the chat
        if (chat.user.toString() !== socket.user._id.toString()) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }
        
        // Add user message to chat
        chat.messages.push({
          sender: 'user',
          content: message,
        });
        
        // Emit typing indicator
        socket.emit('typing', { chatId });
        
        // Analyze message
        const messageType = analyzeMessage(message);
        
        let aiResponse;
        
        if (messageType.type === 'calculation') {
          // Perform calculation
          const result = await calculationService.performCalculation(
            messageType.subType, 
            messageType.params
          );
          aiResponse = formatCalculationResponse(result, messageType.subType);
        } else {
          // Get AI response
          aiResponse = await aiService.getResponse(message, chat.messages);
        }
        
        // Add AI response to chat
        chat.messages.push({
          sender: 'ai',
          content: aiResponse,
        });
        
        await chat.save();
        
        // Emit stop typing indicator
        socket.emit('stop_typing', { chatId });
        
        // Emit updated chat
        socket.emit('chat_updated', { chat });
      } catch (error) {
        console.error('Socket error:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);
    });
  });
};

// Helper function to analyze message
const analyzeMessage = (message) => {
  // Simple analysis to determine if message is a calculation request
  const costPattern = /تكلفة|cost|price|budget/i;
  const energyPattern = /طاقة|energy|power|consumption/i;
  const roiPattern = /عائد الاستثمار|roi|return on investment|payback/i;
  
  if (costPattern.test(message)) {
    return {
      type: 'calculation',
      subType: 'cost',
      params: extractParams(message, 'cost')
    };
  } else if (energyPattern.test(message)) {
    return {
      type: 'calculation',
      subType: 'energy',
      params: extractParams(message, 'energy')
    };
  } else if (roiPattern.test(message)) {
    return {
      type: 'calculation',
      subType: 'roi',
      params: extractParams(message, 'roi')
    };
  } else {
    return {
      type: 'general'
    };
  }
};

// Helper function to extract parameters from message
const extractParams = (message, type) => {
  // This would be a more sophisticated function in production
  // For now, we'll return some default parameters
  return {
    projectType: 'solar',
    capacity: 100, // kW
    location: 'default'
  };
};

// Helper function to format calculation response
const formatCalculationResponse = (result, type) => {
  switch (type) {
    case 'cost':
      return `Based on my calculations, the estimated cost for this project would be $${result.cost.toLocaleString()}. This includes equipment costs of $${result.equipmentCost.toLocaleString()} and installation costs of $${result.installationCost.toLocaleString()}.`;
    case 'energy':
      return `The estimated annual energy production would be ${result.annualProduction.toLocaleString()} kWh, which is equivalent to powering approximately ${result.homesEquivalent} homes.`;
    case 'roi':
      return `The estimated return on investment (ROI) period is ${result.roiYears} years. After this period, the project will generate approximately $${result.annualSavings.toLocaleString()} in savings or revenue per year.`;
    default:
      return 'I couldn\'t perform that calculation. Please provide more details.';
  }
};
