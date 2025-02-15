import Stripe from "stripe";
import dotenv from "dotenv";
import { Request, Response } from "express";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY os required but was not found in env variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripePaymentIntent = async (req: Request, res: Response): Promise<void> => {
  let { amount } = req.body;
  if (!amount || amount <= 0) {
    amount = 50;
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
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
  } catch (error) {
    res.status(500).json({ message: "Error creating stripe payment intent", error });
  }
};

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  const { userId, courseId, transactionId, paymentProvider, amount } = req.body;
  try {
    const course = await Course.get(courseId);
    const newTransaction = new Transaction({
      dateTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId,
      paymentProvider,
      amount,
    });
    await newTransaction.save();
    const initialProgress = new UserCourseProgress({
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      overallProgress: 0,
      sections: course.sections.map((section: any) => ({
        sectionId: section.sectionId,
        chapters: section.chapters.map((chapter: any) => ({
          chapterId: chapter.chapterId,
          videos: chapter.videos.map((video: any) => ({
            videoId: video.videoId,
            watched: false,
          })),
        })),
      })),
      lastAccessedTimestamp: new Date().toISOString(),
    });
    initialProgress.save();
    await Course.update(
      {
        courseId,
      },
      { $ADD: { enrollments: [userId] } }
    );
    res.json({ message: "purchased course successfully", data: newTransaction });
  } catch (error) {
    res.status(500).json({ message: "Error creating transaction and enrollment", error });
  }
};
