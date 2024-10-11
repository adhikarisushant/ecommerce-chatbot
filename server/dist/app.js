"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv").config();
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./middleware/error");
const conversationManager_1 = require("./conversationManager");
// body parser
exports.app.use(express_1.default.json());
// cookie parser
exports.app.use((0, cookie_parser_1.default)());
// Static conversation tree
const defaultTree = {
    nodes: {
        welcome: {
            id: 'welcome',
            message: 'Welcome to our store! How can I help you today?',
            type: 'multiple_choice',
            options: [
                { text: 'Product recommendations', nextNodeId: 'product_recommendations' },
                { text: 'Order status', nextNodeId: 'order_status' },
                { text: 'FAQ', nextNodeId: 'faq' }
            ]
        },
        product_recommendations: {
            id: 'product_recommendations',
            message: 'What type of products are you interested in?',
            type: 'multiple_choice',
            options: [
                { text: 'Electronics', nextNodeId: 'electronics' },
                { text: 'Clothing', nextNodeId: 'clothing' },
                { text: 'Books', nextNodeId: 'books' }
            ]
        },
        electronics: {
            id: 'electronics',
            message: 'What type of Electronic products do you want?',
            type: 'multiple_choice',
            options: [
                { text: 'Personal Computers', nextNodeId: 'personalcomputers' },
                { text: 'Mobile Phones', nextNodeId: 'mobilephones' },
                { text: 'Tablets', nextNodeId: 'tablets' },
            ]
        },
        personalcomputers: {
            id: 'personalcomputers',
            message: 'What type of Personal Computers do you want?',
            type: 'multiple_choice',
            options: [
                { text: 'Desktop' },
                { text: 'Laptop', },
                { text: 'Work Station' },
            ]
        },
        order_status: {
            id: "order_status",
            message: "What information do you need about your order?",
            type: "multiple_choice",
            options: [
                { text: "Track Package", nextNodeId: "track_package" },
                { text: "Order Details", nextNodeId: "order_details" },
                { text: "Cancel Order", nextNodeId: "cancel_order" }
            ]
        },
        track_package: {
            id: "track_package",
            message: "Please provide your tracking number:",
            type: "text"
        },
        order_details: {
            id: "order_details",
            message: "Please provide your order number:",
            type: "text"
        },
        cancel_order: {
            id: "cancel_order",
            message: "Are you sure you want to cancel your order?",
            type: "multiple_choice",
            options: [
                { "text": "Yes, cancel my order" },
                { "text": "No, keep my order" }
            ]
        },
        "faq": {
            id: "faq",
            message: "What topic do you need help with?",
            type: "multiple_choice",
            options: [
                { "text": "Returns & Refunds", nextNodeId: "returns_refunds" },
                { "text": "Shipping Information", nextNodeId: "shipping_info" },
                { "text": "Payment Methods", nextNodeId: "payment_methods" }
            ]
        },
        "returns_refunds": {
            id: "returns_refunds",
            message: "What specific information do you need about returns and refunds?",
            type: "multiple_choice",
            options: [
                { "text": "Return Policy" },
                { "text": "How to Initiate a Return" },
                { "text": "Refund Timeline" }
            ]
        },
        "shipping_info": {
            id: "shipping_info",
            message: "What do you want to know about shipping?",
            type: "multiple_choice",
            options: [
                { "text": "Shipping Costs" },
                { "text": "Delivery Timeframes" },
                { "text": "International Shipping" }
            ]
        },
        "payment_methods": {
            id: "payment_methods",
            message: "What information do you need about payment methods?",
            type: "multiple_choice",
            options: [
                { "text": "Accepted Payment Types" },
                { "text": "Billing Information" },
                { "text": "Payment Security" }
            ]
        },
        final_node: {
            id: 'final_node',
            message: "Thank you for your interest! Is there anything else I can help you with?",
            type: 'multiple_choice',
            options: [
                { text: 'Start Over', nextNodeId: 'welcome' },
                { text: 'No, thanks', nextNodeId: 'goodbye' }
            ]
        },
        goodbye: {
            id: 'goodbye',
            message: "Thank you for chatting with us! Have a great day!",
            type: 'text',
            isEndNode: true
        }
    },
    startNodeId: 'welcome'
};
// cors
exports.app.use((0, cors_1.default)());
const conversationManager = new conversationManager_1.ConversationManager(defaultTree);
exports.app.post('/api/chat/start', (req, res) => {
    const { customerId } = req.body;
    const state = conversationManager.initializeConversation(customerId);
    const currentNode = conversationManager.getCurrentNode(customerId);
    res.json({ state, currentNode });
});
exports.app.post('/api/chat/response', (req, res) => {
    const { customerId, response } = req.body;
    const nextNode = conversationManager.processResponse(customerId, response);
    res.json({ node: nextNode });
});
exports.app.put('/api/config/tree', (req, res) => {
    const newTree = req.body;
    conversationManager.updateConversationTree(newTree);
    res.json({ success: true });
});
exports.app.post('/api/chat/restart', (req, res) => {
    const { customerId } = req.body;
    const nextNode = conversationManager.restartConversation(customerId);
    res.json({ node: nextNode });
});
// testing api
exports.app.get("/test", (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});
//unknown api route
exports.app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});
exports.app.use(error_1.ErrorMiddleware);
