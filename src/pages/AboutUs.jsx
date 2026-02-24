import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const AboutUs = () => {
    const { t } = useLanguage();

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 overflow-hidden">
            {/* Hero Section */}
            <div className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <svg
                            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
                            fill="currentColor"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <polygon points="50,0 100,0 50,100 0,100" />
                        </svg>

                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={staggerContainer}
                                className="sm:text-center lg:text-left"
                            >
                                <motion.h1
                                    variants={fadeInUp}
                                    className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                                >
                                    <span className="block xl:inline">{t.aboutTitle}</span>{' '}
                                    <span className="block text-red-600 xl:inline">{t.aboutSubtitle}</span>
                                </motion.h1>
                                <motion.p
                                    variants={fadeInUp}
                                    className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                                >
                                    {t.missionText}
                                </motion.p>
                                <motion.div
                                    variants={fadeInUp}
                                    className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                                >
                                    <div className="rounded-md shadow">
                                        <Link
                                            to="/signup"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 md:py-4 md:text-lg md:px-10"
                                        >
                                            {t.joinUs}
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            to="/"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 md:py-4 md:text-lg md:px-10"
                                        >
                                            {t.home}
                                        </Link>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <motion.img
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
                        src="https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                        alt="Online Marketplace"
                    />
                </div>
            </div>

            {/* Mission Section */}
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:text-center"
                    >
                        <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">{t.ourMission}</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            {t.whyChooseUs}
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            {t.missionText}
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="mt-10"
                    >
                        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                            {[
                                {
                                    title: t.feature1Title,
                                    desc: t.feature1Desc,
                                    icon: (
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ),
                                },
                                {
                                    title: t.feature2Title,
                                    desc: t.feature2Desc,
                                    icon: (
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    ),
                                },
                                {
                                    title: t.feature3Title,
                                    desc: t.feature3Desc,
                                    icon: (
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                        </svg>
                                    ),
                                },
                            ].map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    variants={fadeInUp}
                                    className="relative"
                                >
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                                            {feature.icon}
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-500">
                                        {feature.desc}
                                    </dd>
                                </motion.div>
                            ))}
                        </dl>
                    </motion.div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-red-700">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">{t.joinUs}</span>
                        <span className="block">{t.callToAction}</span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-red-200">
                        {t.missionText}
                    </p>
                    <Link
                        to="/signup"
                        className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 sm:w-auto"
                    >
                        {t.signUp}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
