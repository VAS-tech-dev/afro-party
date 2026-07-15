import { Hero } from '@/sections/Hero';
import { Event } from '@/sections/Event';
import { WhyJoin } from '@/sections/WhyJoin';
import { TicketPrices } from '@/sections/TicketPrices';
import { Location } from '@/sections/Location';
import { FinalCTA } from '@/sections/FinalCTA';

/**
 * Landing page — assembles the premium marketing sections in reading order.
 * Ticket prices deliberately come before the CTA so visitors know the cost
 * before being asked to confirm their attendance.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Event />
      <WhyJoin />
      <TicketPrices />
      <Location />
      <FinalCTA />
    </>
  );
}
