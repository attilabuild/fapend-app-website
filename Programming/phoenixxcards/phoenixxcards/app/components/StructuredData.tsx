export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://phoenixcards.com/#organization",
        "name": "Phoenix Cards",
        "url": "https://phoenixcards.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://phoenixcards.com/favicon.svg",
          "width": 32,
          "height": 32
        },
        "description": "Revolutionary flashcard system with AI-powered spaced repetition",
        "foundingDate": "2024",
        "sameAs": [
          "https://twitter.com/phoenixcards",
          "https://linkedin.com/company/phoenixcards"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://phoenixcards.com/#website",
        "url": "https://phoenixcards.com",
        "name": "Phoenix Cards",
        "description": "Ignite your learning with AI-powered flashcards",
        "publisher": {
          "@id": "https://phoenixcards.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://phoenixcards.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://phoenixcards.com/#software",
        "name": "Phoenix Cards",
        "description": "AI-powered flashcard learning platform with spaced repetition",
        "url": "https://phoenixcards.com",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser, iOS, Android",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Free tier with basic features"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "1250",
          "bestRating": "5",
          "worstRating": "1"
        },
        "author": {
          "@id": "https://phoenixcards.com/#organization"
        }
      },
      {
        "@type": "WebPage",
        "@id": "https://phoenixcards.com/#webpage",
        "url": "https://phoenixcards.com",
        "name": "Phoenix Cards - Ignite Your Learning with AI-Powered Flashcards",
        "description": "Revolutionary flashcard system with AI-powered spaced repetition. Transform your study routine and achieve mastery faster than ever before.",
        "isPartOf": {
          "@id": "https://phoenixcards.com/#website"
        },
        "about": {
          "@id": "https://phoenixcards.com/#software"
        },
        "primaryImageOfPage": {
          "@id": "https://phoenixcards.com/og-image.png"
        },
        "datePublished": "2024-01-01T00:00:00+00:00",
        "dateModified": "2024-12-19T00:00:00+00:00",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://phoenixcards.com"
            }
          ]
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does Phoenix Cards improve learning retention?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Phoenix Cards uses AI-powered spaced repetition algorithms that adapt to your learning pace, showing you cards at optimal intervals to maximize retention. Our users report up to 300% improvement in learning retention."
            }
          },
          {
            "@type": "Question",
            "name": "Is Phoenix Cards free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Phoenix Cards offers a free tier with up to 100 flashcards and basic spaced repetition features. We also offer Pro and Team plans with advanced features for power users."
            }
          },
          {
            "@type": "Question",
            "name": "Can I use Phoenix Cards on multiple devices?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely! Phoenix Cards syncs across all your devices - phone, tablet, and computer. Your progress and flashcards are always up to date wherever you study."
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
