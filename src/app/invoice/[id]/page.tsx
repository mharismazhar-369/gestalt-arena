import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GestaltCoin from "@/components/ui/GestaltCoin";
import PrintReceiptButton from "@/components/ui/PrintReceiptButton";
import { CheckCircle2, Receipt, ArrowLeft } from "lucide-react";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--primary)] text-[var(--secondary)]">
                <p className="text-sm font-bold">Please log in to view this receipt.</p>
            </div>
        );
    }

    const { data: transaction, error } = await supabase
        .from("transaction_ledger")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error || !transaction) {
        notFound();
    }

    const formatDescription = (type: string) => {
        if (type.startsWith("subscription_")) {
            const parts = type.split("_");
            const tier = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "";
            const cycle = parts[2] ? parts[2].charAt(0).toUpperCase() + parts[2].slice(1) : "";
            return `${tier} Tier - ${cycle} Subscription`;
        }
        return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    };

    const date = new Date(transaction.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between">
            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-6 mx-auto max-w-3xl w-full flex flex-col items-center">
                <div className="flex flex-col items-center mb-10 space-y-4 text-center">
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)]">
                        <CheckCircle2 size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--secondary)]">
                        Payment Successful
                    </h1>
                    <p className="text-xs font-medium text-[var(--secondary)]/60 max-w-md leading-relaxed">
                        Your capabilities have been unlocked. The required Gestalt Coins have been securely deducted from your wallet ledger.
                    </p>
                </div>

                <div className="neu-flat-base p-8 md:p-10 w-full relative overflow-hidden rounded-3xl">
                    <div className="absolute -top-4 -right-4 p-6 opacity-5 pointer-events-none">
                        <Receipt size={160} />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="flex flex-col md:flex-row md:justify-between gap-4 border-b border-[var(--secondary)]/10 pb-6">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary)]/50 block mb-1">
                                    Transaction Hash
                                </span>
                                <span className="text-xs font-mono font-bold text-[var(--secondary)]">
                                    {transaction.id}
                                </span>
                            </div>
                            <div className="md:text-right">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary)]/50 block mb-1">
                                    Date Authorized
                                </span>
                                <span className="text-xs font-bold text-[var(--secondary)]">
                                    {date}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary)]/50 block">
                                Acquired Assets
                            </span>
                            <div className="neu-pressed-base p-5 rounded-2xl flex justify-between items-center">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-sm font-black text-[var(--secondary)]">
                                        {formatDescription(transaction.transaction_type)}
                                    </span>
                                    <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">
                                        Status: {transaction.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xl font-black text-[var(--secondary)]">
                                    <GestaltCoin className="w-5 h-5 text-[var(--accent)]" />
                                    {transaction.amount_deducted}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-[var(--secondary)]/10">
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary)]/50">
                                    Total Deducted
                                </span>
                                <div className="flex items-center gap-2 text-3xl font-black text-[var(--secondary)]">
                                    <GestaltCoin className="w-6 h-6 text-[var(--accent)]" />
                                    {transaction.amount_deducted}
                                </div>
                                <span className="text-[9px] font-mono font-bold text-[var(--secondary)]/40 mt-1 uppercase tracking-wider">
                                    (1G = $1.00 USD)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full md:w-auto">
                    <Link
                        href="/dashboard"
                        className="w-full sm:w-auto text-[var(--accent)] border-[var(--accent)] border shadow-[5px_5px_10px_var(--shadow-dark),-5px_-5px_10px_var(--shadow-light)] hover:shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] bg-[var(--primary)] px-8 py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={16} /> Return to Dashboard
                    </Link>

                    {/* Client Component injected here */}
                    <PrintReceiptButton />
                </div>
            </main>

            <Footer />
        </div>
    );
}