import { Link, useLocation } from "react-router-dom";

const pageContent = {
  about: {
    title: "About Kione Hardware",
    intro:
      "A dependable local source for building materials, tools, finishes, and everyday essentials.",
    body: "Kione Hardware serves customers across Nairobi and beyond with practical products, clear pricing, and personal service. Browse our catalogue online and contact us when you need help choosing the right item.",
  },
  contact: {
    title: "Contact Us",
    intro: "We are here to help with products, orders, and delivery questions.",
    body: "Visit us in Nairobi, Kenya, call 0712 437 715, or email info@kionehardware.com. Our team is available Monday to Saturday, 8AM to 7PM.",
  },
  faq: {
    title: "Frequently Asked Questions",
    intro: "Useful answers before you place an order.",
    body: "Products are available while stock lasts. Add items to your cart, review your order, and sign in or create an account when you are ready to pay with M-Pesa.",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    intro: "Your information is handled with care.",
    body: "We use the information you provide to process orders, support your account, and communicate about your requests. We do not sell your personal information.",
  },
  terms: {
    title: "Terms & Conditions",
    intro: "The terms that apply when you use our shop.",
    body: "Product availability and prices may change. Orders are confirmed after successful payment. Please provide accurate contact and delivery information so we can process your order correctly.",
  },
  returns: {
    title: "Returns Policy",
    intro: "We want you to be confident in your purchase.",
    body: "Contact us as soon as possible if an item arrives damaged or differs from your order. Keep the item and proof of purchase available while we review your request.",
  },
  payment: {
    title: "Payment Methods",
    intro: "Pay securely with M-Pesa.",
    body: "Checkout supports M-Pesa payments. Enter the phone number registered to your M-Pesa account and approve the payment prompt on your phone.",
  },
};

const InfoPage = () => {
  const { pathname } = useLocation();
  const page = pathname.slice(1);
  const content = pageContent[page] || pageContent.about;

  return (
    <section className="mx-auto max-w-5xl py-10 sm:py-16">
      <div className="mb-8 text-center">
        <div className="brick-line mx-auto mb-4" />
        <h1 className="font-h text-3xl font-bold text-black sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-3 text-lg text-ash">{content.intro}</p>
      </div>
      <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-10">
        <p className="leading-8 text-ash">{content.body}</p>
        <Link
          to="/products"
          className="mt-8 inline-flex rounded-xl bg-terra px-5 py-3 font-semibold text-white transition hover:bg-terra-dark"
        >
          Browse Products
        </Link>
      </article>
    </section>
  );
};

export default InfoPage;
