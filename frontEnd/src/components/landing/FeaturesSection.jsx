import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  House,
  UserRound,
  Target,
  CalendarDays,
  Droplets,
  Brush
} from "lucide-react";

const features = [
  {
    id: "expert-artistry",
    icon: Brush,
    title: "Expert Artistry",
    description:
      "Professional makeup artist with years of experience in bridal and party makeup",
  },
  {
    id: "premium-products",
    icon: Droplets,
    title: "Premium Products",
    description:
      "Using only high-quality products for a flawless, long-lasting finish",
  },
  {
    id: "home-service",
    icon: House,
    title: "Home Service",
    description:
      "Convenient doorstep service for weddings, parties, and special occasions",
  },
  {
    id: "custom-looks",
    icon: UserRound,
    title: "Custom Looks",
    description:
      "Personalized makeup styles that enhance your natural beauty",
  },
  {
    id: "satisfaction-guaranteed",
    icon: Target,
    title: "Satisfaction Guaranteed",
    description:
      "100% client satisfaction with attention to every detail",
  },
  {
    id: "flexible-booking",
    icon: CalendarDays,
    title: "Flexible Booking",
    description:
      "Easy online booking and flexible scheduling for your convenience",
  },
];

const Card = memo(({ item, index }) => {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      viewport={{ once: false, amount: 0.2 }}
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className="group w-full cursor-pointer sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
    >
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-100 md:p-6">
        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            className="mb-3 inline-flex rounded-2xl bg-pink-50 p-3 text-4xl text-pink-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-pink-100 md:text-5xl"
            whileHover={{ scale: 1.1, rotate: 6 }}
          >
            <Icon strokeWidth={2} className="h-8 w-8 md:h-10 md:w-10" />
          </motion.div>

          <h3 className="mb-2 text-base font-semibold text-gray-800 transition-all duration-300 group-hover:scale-105 group-hover:text-pink-500 md:text-lg">
            {item.title}
          </h3>

          <p className="text-xs text-gray-400 transition-all duration-300 group-hover:text-gray-700 md:text-sm">
            {item.description}
          </p>
        </div>

        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </motion.div>
  );
});

Card.displayName = "Card";

const FeaturesSection = memo(() => {
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-white px-4 py-16 sm:px-6 md:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.2 }}
          className="mb-10 text-center md:mb-12"
        >
          <h2 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl">
            Why Choose Us?
          </h2>

          <p className="mx-auto max-w-2xl text-sm text-gray-500 md:text-base">
            We bring out the best version of you with our expertise and premium
            products.
          </p>

          <div className="mx-auto mt-3 h-0.5 w-16 rounded-full bg-gradient-to-r from-pink-400 to-pink-500" />
        </motion.div>

        <div className="flex flex-wrap gap-4 md:gap-6">
          {features.map((item, index) => (
            <Card key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = "FeaturesSection";

export default FeaturesSection;