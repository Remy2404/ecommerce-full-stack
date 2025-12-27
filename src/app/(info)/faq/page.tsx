'use client';

import { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

const faqCategories = [
  {
    name: 'Orders & Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping takes 3-5 business days within Cambodia. Express shipping is available for 1-2 day delivery. International shipping typically takes 7-14 business days depending on the destination.',
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! Once your order ships, you\'ll receive an email with a tracking number. You can also track your order from your account dashboard under "Orders".',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. You\'ll see the exact shipping cost at checkout.',
      },
      {
        q: 'What if my order is delayed?',
        a: 'If your order is delayed beyond the estimated delivery date, please contact our support team. We\'ll investigate and provide updates. In some cases, we may offer compensation or expedited shipping.',
      },
    ],
  },
  {
    name: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 30-day return policy for most items. Products must be unused, in original packaging, and with all tags attached. Some items like personalized products may not be eligible for returns.',
      },
      {
        q: 'How do I return an item?',
        a: 'Start a return from your account or contact our support team. You\'ll receive a prepaid shipping label and instructions. Once we receive and inspect the item, we\'ll process your refund.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are processed within 5-7 business days after we receive your return. The refund will be credited to your original payment method. It may take additional time for your bank to process.',
      },
    ],
  },
  {
    name: 'Payment & Security',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept Visa, Mastercard, JCB, Wing Money, and Cash on Delivery. All card transactions are secured with SSL encryption.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Absolutely. We use industry-standard SSL encryption and never store your full credit card number. Our payment processing is PCI-DSS compliant.',
      },
      {
        q: 'Can I pay with Cash on Delivery?',
        a: 'Yes, Cash on Delivery is available for orders within Cambodia. Please have the exact amount ready when your order arrives.',
      },
    ],
  },
  {
    name: 'Account & Profile',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" at the top of the page. You can register with your email or use Google sign-in for faster access.',
      },
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot Password" on the login page. We\'ll send a password reset link to your email address.',
      },
      {
        q: 'Can I change my email address?',
        a: 'Yes, you can update your email in Account Settings. You\'ll need to verify the new email address before the change takes effect.',
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-primary"
      >
        <span className="font-medium">{question}</span>
        <ChevronDown 
          className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-muted-foreground">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <HelpCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Find answers to common questions about orders, shipping, returns, and more.
            </p>
            
            {/* Search */}
            <div className="mt-8">
              <Input
                type="search"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="mx-auto max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div key={category.name} className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">{category.name}</h2>
                <div className="rounded-design-lg border border-border bg-card">
                  {category.questions.map((item, index) => (
                    <FAQItem key={index} question={item.q} answer={item.a} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No questions found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mx-auto mt-12 max-w-xl rounded-design-lg border border-border bg-muted/30 p-8 text-center">
          <h3 className="text-lg font-semibold">Still have questions?</h3>
          <p className="mt-2 text-muted-foreground">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="mt-4 inline-flex items-center text-primary hover:underline"
          >
            Contact Support →
          </a>
        </div>
      </section>
    </div>
  );
}
