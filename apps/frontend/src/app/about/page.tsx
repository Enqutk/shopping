import Link from 'next/link';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/store/StoreFooter';
import StoreScene from '../../components/immersive/StoreScene';
import PartnersComingSoonSection from '../../components/about/PartnersComingSoonSection';

export const metadata = {
  title: 'About | LUXE',
  description: 'Our story and upcoming partnerships with delivery partners and shop owners.',
};

export default function AboutPage() {
  return (
    <div className="store-page">
      <StoreScene>
        <StoreHeader />

        <main id="main-content" className="flex-1">
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-femme-champagne mb-4">
              About us
            </p>
            <h1 className="section-heading text-3xl sm:text-4xl lg:text-5xl">LUXE Natural Beauty</h1>
            <p className="text-sm sm:text-base text-arctic-light mt-6 max-w-2xl mx-auto normal-case tracking-normal leading-relaxed">
              We curate premium fashion and lifestyle pieces with an editorial eye: dark luxe,
              timeless essentials, and a shopping experience that feels personal from cart to
              doorstep.
            </p>
            <div className="femme-divider mx-auto mt-8" />
            <Link href="/products" className="btn-ghost mt-6 inline-block">
              Shop the collection
            </Link>
          </section>

          <PartnersComingSoonSection />
        </main>

        <StoreFooter />
      </StoreScene>
    </div>
  );
}
