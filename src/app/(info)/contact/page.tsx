'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, FormField } from '@/components/ui/input';

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@store.com',
    href: 'mailto:support@store.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+855 23 456 789',
    href: 'tel:+85523456789',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: '123 Street 123, Phnom Penh, Cambodia',
    href: null,
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
    href: null,
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Contact Us
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have a question or feedback? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div>
            <h2 className="mb-6 text-2xl font-bold">Send us a Message</h2>
            
            {isSubmitted ? (
              <div className="rounded-design-lg border border-success/20 bg-success/5 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground">
                  <Send className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Message Sent!</h3>
                <p className="mt-2 text-muted-foreground">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="Name" required>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </FormField>
                  <FormField label="Email" required>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                    />
                  </FormField>
                </div>
                
                <FormField label="Subject" required>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    required
                  />
                </FormField>
                
                <FormField label="Message" required>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    required
                  />
                </FormField>
                
                <Button type="submit" size="lg" isLoading={isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="mb-6 text-2xl font-bold">Get in Touch</h2>
            
            <div className="space-y-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-design-sm bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a 
                        href={item.href} 
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="mt-8">
              <h3 className="mb-4 font-semibold">Find Us</h3>
              <div className="aspect-video overflow-hidden rounded-design-lg bg-muted">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <MapPin className="mr-2 h-5 w-5" />
                  Map Loading...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
