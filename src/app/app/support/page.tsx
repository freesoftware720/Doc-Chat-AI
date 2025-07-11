
import { redirect } from 'next/navigation';
import { getUserTickets } from '@/app/actions/support';
import { SupportClientPage } from './support-client-page';

export default async function SupportPage() {
    const tickets = await getUserTickets();
    const openTicket = tickets.find(t => t.status === 'open' || t.status === 'in_progress');
    
    // If user has an open ticket, redirect them straight to it
    if (openTicket) {
        redirect(`/app/support/${openTicket.id}`);
    }

    return (
        <SupportClientPage tickets={tickets} />
    )
}
