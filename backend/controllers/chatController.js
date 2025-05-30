const Chat = require('../models/Chat');
const aiService = require('../services/aiService');
const calculationService = require('../services/calculationService');

// @desc    Send message to public chat (no database required)
// @route   POST /api/chat/public
// @access  Public
const sendPublicMessage = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        message: 'Please add a valid message'
      });
    }

    // Limit message length for security
    if (message.length > 1000) {
      return res.status(400).json({
        message: 'Message is too long. Maximum length is 1000 characters.'
      });
    }

    console.log('Public chat message received:', message);

    let aiResponse;

    try {
      // Get AI response without database dependency
      aiResponse = await aiService.getResponse(message, []);
    } catch (aiError) {
      console.error('AI Service error:', aiError);
      // Detect if message is in Arabic for error response
      const isArabic = /[\u0600-\u06FF]/.test(message);
      aiResponse = isArabic
        ? "عذراً، واجهت خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً."
        : "I'm sorry, I encountered an error processing your request. Please try again later.";
    }

    // Return response without saving to database
    res.status(200).json({
      success: true,
      message: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send public message error:', error);
    res.status(500).json({
      message: 'Server error while processing message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new chat
// @route   POST /api/chat
// @access  Private
const createChat = async (req, res) => {
  try {
    const { title } = req.body;

    const chat = await Chat.create({
      user: req.user._id,
      title: title || 'New Chat',
      messages: [],
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all user chats
// @route   GET /api/chat
// @access  Private
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort('-updatedAt');

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single chat
// @route   GET /api/chat/:id
// @access  Private
const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      res.status(404);
      throw new Error('Chat not found');
    }

    // Make sure the logged in user matches the chat user
    if (chat.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Send message to chat
// @route   POST /api/chat/:id/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        message: 'Please add a valid message'
      });
    }

    // Limit message length for security
    if (message.length > 1000) {
      return res.status(400).json({
        message: 'Message is too long. Maximum length is 1000 characters.'
      });
    }

    // Validate chat ID
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid chat ID'
      });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        message: 'Chat not found'
      });
    }

    // Make sure the logged in user matches the chat user
    if (chat.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: 'User not authorized'
      });
    }

    // Add user message to chat
    chat.messages.push({
      sender: 'user',
      content: message,
    });

    // Analyze message to determine if it's a calculation request
    const messageType = analyzeMessage(message);

    let aiResponse;

    try {
      if (messageType.type === 'calculation') {
        // Perform calculation
        const result = await calculationService.performCalculation(
          messageType.subType,
          messageType.params
        );
        // Detect if message is in Arabic
        const isArabic = /[\u0600-\u06FF]/.test(message);
        aiResponse = formatCalculationResponse(result, messageType.subType, isArabic);
      } else {
        // Get AI response
        aiResponse = await aiService.getResponse(message, chat.messages);
      }
    } catch (aiError) {
      console.error('AI Service error:', aiError);
      // Detect if message is in Arabic for error response
      const isArabic = /[\u0600-\u06FF]/.test(message);
      aiResponse = isArabic
        ? "عذراً، واجهت خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً."
        : "I'm sorry, I encountered an error processing your request. Please try again later.";
    }

    // Add AI response to chat
    chat.messages.push({
      sender: 'ai',
      content: aiResponse,
    });

    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Server error while sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete chat
// @route   DELETE /api/chat/:id
// @access  Private
const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Make sure the logged in user matches the chat user
    if (chat.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Use findByIdAndDelete instead of deprecated remove()
    await Chat.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      message: 'Server error while deleting chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to analyze message
const analyzeMessage = (message) => {
  // Convert message to lowercase for case-insensitive matching
  const lowerMessage = message.toLowerCase();

  // Define patterns for different calculation types
  const patterns = {
    cost: [
      /تكلفة/i,
      /cost/i,
      /price/i,
      /budget/i,
      /how much.*cost/i,
      /estimate.*cost/i,
      /كم تكلف/i,
      /كم سعر/i
    ],
    energy: [
      /طاقة/i,
      /energy/i,
      /power/i,
      /consumption/i,
      /production/i,
      /output/i,
      /كم تنتج/i,
      /كمية الطاقة/i
    ],
    roi: [
      /عائد الاستثمار/i,
      /roi/i,
      /return on investment/i,
      /payback/i,
      /break even/i,
      /متى يسترد/i,
      /فترة الاسترداد/i
    ]
  };

  // Check for project type
  const projectTypes = {
    solar: [/solar/i, /pv/i, /photovoltaic/i, /شمس/i, /شمسي/i],
    wind: [/wind/i, /turbine/i, /رياح/i],
    hydro: [/hydro/i, /water/i, /مائي/i],
    geothermal: [/geothermal/i, /حراري أرضي/i],
    biomass: [/biomass/i, /bio/i, /حيوي/i]
  };

  // Extract project type
  let detectedProjectType = 'solar'; // Default
  for (const [type, typePatterns] of Object.entries(projectTypes)) {
    if (typePatterns.some(pattern => pattern.test(lowerMessage))) {
      detectedProjectType = type;
      break;
    }
  }

  // Extract capacity - improved regex to handle Arabic and English numbers
  let capacity = 100; // Default

  // First try to match number with kW units
  const capacityMatch = lowerMessage.match(/(\d+)\s*(kw|كيلوواط|kilowatt|كيلو واط)/i);

  if (capacityMatch) {
    capacity = parseInt(capacityMatch[1], 10);
  } else {
    // Try to extract any number from the message as capacity
    // Look for patterns like "بقدرة 200" or "capacity 200"
    const numberMatch = lowerMessage.match(/(?:بقدرة|capacity|قدرة|power)\s*(\d+)|(\d+)\s*(?:kw|كيلوواط|kilowatt)/i);

    if (numberMatch) {
      const extractedNumber = parseInt(numberMatch[1] || numberMatch[2], 10);
      // Only use if it's a reasonable capacity (between 1 and 10000 kW)
      if (extractedNumber >= 1 && extractedNumber <= 10000) {
        capacity = extractedNumber;
      }
    } else {
      // Last resort: extract any number from the message
      const anyNumberMatch = lowerMessage.match(/(\d+)/);

      if (anyNumberMatch) {
        const extractedNumber = parseInt(anyNumberMatch[1], 10);
        // Only use if it's a reasonable capacity (between 1 and 10000 kW)
        if (extractedNumber >= 1 && extractedNumber <= 10000) {
          capacity = extractedNumber;
        }
      }
    }
  }

  // Extract location
  let location = 'default'; // Default
  if (lowerMessage.includes('urban') || lowerMessage.includes('city') || lowerMessage.includes('مدينة')) {
    location = 'urban';
  } else if (lowerMessage.includes('rural') || lowerMessage.includes('countryside') || lowerMessage.includes('ريف')) {
    location = 'rural';
  } else if (lowerMessage.includes('remote') || lowerMessage.includes('isolated') || lowerMessage.includes('نائي')) {
    location = 'remote';
  } else if (lowerMessage.includes('sunny') || lowerMessage.includes('desert') || lowerMessage.includes('مشمس') || lowerMessage.includes('صحراء')) {
    location = 'sunny';
  } else if (lowerMessage.includes('windy') || lowerMessage.includes('coastal') || lowerMessage.includes('عاصف') || lowerMessage.includes('ساحل')) {
    location = 'windy';
  }

  // Determine calculation type
  for (const [calcType, calcPatterns] of Object.entries(patterns)) {
    if (calcPatterns.some(pattern => pattern.test(lowerMessage))) {
      return {
        type: 'calculation',
        subType: calcType,
        params: {
          projectType: detectedProjectType,
          capacity: capacity,
          location: location
        }
      };
    }
  }

  // If no calculation type is detected
  return {
    type: 'general'
  };
};

// Helper function to format calculation response
const formatCalculationResponse = (result, type, isArabic = true) => {
  // Format numbers with 2 decimal places
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0.00';
    }
    return parseFloat(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Get project type in readable format
  const getProjectTypeText = (projectType, isArabic) => {
    const types = {
      'solar': isArabic ? 'الطاقة الشمسية' : 'solar energy',
      'wind': isArabic ? 'طاقة الرياح' : 'wind energy',
      'hydro': isArabic ? 'الطاقة المائية' : 'hydroelectric',
      'geothermal': isArabic ? 'الطاقة الحرارية الأرضية' : 'geothermal energy',
      'biomass': isArabic ? 'طاقة الكتلة الحيوية' : 'biomass energy',
      'other': isArabic ? 'الطاقة' : 'energy'
    };
    return types[projectType] || (isArabic ? 'الطاقة' : 'energy');
  };

  // Format responses based on calculation type
  switch (type) {
    case 'cost':
      if (isArabic) {
        return `بناءً على حساباتي لمشروع ${getProjectTypeText(result.projectType, true)} بقدرة ${formatNumber(result.capacity)} كيلوواط، التكلفة الإجمالية المقدرة هي ${formatNumber(result.cost)} دولار.

هذا يشمل:
• تكلفة المعدات: ${formatNumber(result.equipmentCost)} دولار
• تكلفة التركيب: ${formatNumber(result.installationCost)} دولار
• معامل التركيب: ${formatNumber(result.installationFactor)} (حسب الموقع)

تكلفة الكيلوواط الواحد تقريباً ${formatNumber(result.cost / result.capacity)} دولار.`;
      } else {
        return `Based on my calculations for a ${result.costPerKw ? formatNumber(result.costPerKw) + ' $/kW' : ''} ${getProjectTypeText(result.projectType, false)} project with a capacity of ${formatNumber(result.capacity)} kW, the estimated total cost would be $${formatNumber(result.cost)}.

This includes:
• Equipment costs: $${formatNumber(result.equipmentCost)}
• Installation costs: $${formatNumber(result.installationCost)}
• Installation factor: ${formatNumber(result.installationFactor)}x (based on location)

The cost per kilowatt is approximately $${formatNumber(result.cost / result.capacity)}.`;
      }

    case 'energy':
      if (isArabic) {
        return `لمشروع ${getProjectTypeText(result.projectType, true)} بقدرة ${formatNumber(result.capacity)} كيلوواط، الإنتاج السنوي المقدر للطاقة هو ${formatNumber(result.annualProduction)} كيلوواط ساعة.

هذا يعتمد على:
• معامل القدرة: ${formatNumber(result.capacityFactor * 100)}%
• ساعات التشغيل سنوياً: ${formatNumber(result.hoursPerYear)} ساعة
• عدد المنازل المكافئة: حوالي ${result.homesEquivalent} منزل متوسط

إنتاجية الطاقة تقريباً ${formatNumber(result.annualProduction / result.capacity)} كيلوواط ساعة لكل كيلوواط مركب سنوياً.`;
      } else {
        return `For a ${formatNumber(result.capacity)} kW ${getProjectTypeText(result.projectType, false)} project, the estimated annual energy production would be ${formatNumber(result.annualProduction)} kWh.

This is based on:
• Capacity factor: ${formatNumber(result.capacityFactor * 100)}%
• Operating hours per year: ${formatNumber(result.hoursPerYear)} hours
• Equivalent homes powered: approximately ${result.homesEquivalent} average households

The energy yield is approximately ${formatNumber(result.annualProduction / result.capacity)} kWh per kW of installed capacity per year.`;
      }

    case 'roi':
      if (isArabic) {
        return `لمشروع ${getProjectTypeText(result.projectType, true)} بقدرة ${formatNumber(result.capacity)} كيلوواط وتكلفة إجمالية ${formatNumber(result.totalCost)} دولار، فترة استرداد الاستثمار المقدرة هي ${formatNumber(result.roiYears)} سنة.

هذا يعتمد على:
• الإنتاج السنوي للطاقة: ${formatNumber(result.annualProduction)} كيلوواط ساعة
• سعر الكهرباء: ${formatNumber(result.electricityPrice)} دولار لكل كيلوواط ساعة
• الوفورات/الإيرادات السنوية: ${formatNumber(result.annualSavings)} دولار

بعد فترة الاسترداد، سيستمر المشروع في توليد حوالي ${formatNumber(result.annualSavings)} دولار من الوفورات أو الإيرادات سنوياً.`;
      } else {
        return `For a ${formatNumber(result.capacity)} kW ${getProjectTypeText(result.projectType, false)} project with a total cost of $${formatNumber(result.totalCost)}, the estimated return on investment (ROI) period is ${formatNumber(result.roiYears)} years.

This is based on:
• Annual energy production: ${formatNumber(result.annualProduction)} kWh
• Electricity price: $${formatNumber(result.electricityPrice)} per kWh
• Annual savings/revenue: $${formatNumber(result.annualSavings)}

After the ROI period, the project will continue to generate approximately $${formatNumber(result.annualSavings)} in savings or revenue per year.`;
      }

    default:
      if (isArabic) {
        return 'لم أتمكن من إجراء هذا الحساب. يرجى تقديم المزيد من التفاصيل حول نوع الحساب المطلوب ونوع المشروع والقدرة والموقع.';
      } else {
        return 'I couldn\'t perform that calculation. Please provide more details about the type of calculation you need, the project type, capacity, and location.';
      }
  }
};

module.exports = {
  createChat,
  getChats,
  getChat,
  sendMessage,
  sendPublicMessage,
  deleteChat,
};
