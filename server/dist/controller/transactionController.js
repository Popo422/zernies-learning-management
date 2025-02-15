"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = exports.createStripePaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const courseModel_1 = __importDefault(require("../models/courseModel"));
const transactionModel_1 = __importDefault(require("../models/transactionModel"));
const userCourseProgressModel_1 = __importDefault(require("../models/userCourseProgressModel"));
dotenv_1.default.config();
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY os required but was not found in env variables");
}
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const createStripePaymentIntent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { amount } = req.body;
    if (!amount || amount <= 0) {
        amount = 50;
    }
    try {
        const paymentIntent = yield stripe.paymentIntents.create({
            amount,
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never",
            },
        });
        res.json({
            message: "",
            data: {
                clientSecret: paymentIntent.client_secret,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating stripe payment intent", error });
    }
});
exports.createStripePaymentIntent = createStripePaymentIntent;
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, courseId, transactionId, paymentProvider, amount } = req.body;
    try {
        const course = yield courseModel_1.default.get(courseId);
        const newTransaction = new transactionModel_1.default({
            dateTime: new Date().toISOString(),
            userId,
            courseId,
            transactionId,
            paymentProvider,
            amount,
        });
        yield newTransaction.save();
        const initialProgress = new userCourseProgressModel_1.default({
            userId,
            courseId,
            enrollmentDate: new Date().toISOString(),
            overallProgress: 0,
            sections: course.sections.map((section) => ({
                sectionId: section.sectionId,
                chapters: section.chapters.map((chapter) => ({
                    chapterId: chapter.chapterId,
                    videos: chapter.videos.map((video) => ({
                        videoId: video.videoId,
                        watched: false,
                    })),
                })),
            })),
            lastAccessedTimestamp: new Date().toISOString(),
        });
        initialProgress.save();
        yield courseModel_1.default.update({
            courseId,
        }, { $ADD: { enrollments: [userId] } });
        res.json({ message: "purchased course successfully", data: newTransaction });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating transaction and enrollment", error });
    }
});
exports.createTransaction = createTransaction;
