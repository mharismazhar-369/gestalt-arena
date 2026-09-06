export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string | null
          id: string
          read_time: string | null
          summary: string | null
          title: string
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string | null
          id?: string
          read_time?: string | null
          summary?: string | null
          title: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          read_time?: string | null
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          receiver_id: string
          requester_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          receiver_id: string
          requester_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          conversation_type: string | null
          created_at: string
          id: string
          initiator_id: string
          opportunity_id: string | null
          recipient_id: string
          status: string
        }
        Insert: {
          conversation_type?: string | null
          created_at?: string
          id?: string
          initiator_id: string
          opportunity_id?: string | null
          recipient_id: string
          status?: string
        }
        Update: {
          conversation_type?: string | null
          created_at?: string
          id?: string
          initiator_id?: string
          opportunity_id?: string | null
          recipient_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "fundraising_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          id: string
          name: string
        }
        Insert: {
          code: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      deal_ledger: {
        Row: {
          additional_terms: string | null
          closed_at: string
          deal_id: string | null
          final_equity: number
          final_ticket_size: number
          final_valuation: number
          id: string
          investor_fee: number
          investor_id: string | null
          startup_fee: number
          startup_id: string | null
          transaction_hash: string
          transfer_bank_name: string | null
          transfer_mode: string | null
          transfer_reference: string | null
        }
        Insert: {
          additional_terms?: string | null
          closed_at?: string
          deal_id?: string | null
          final_equity: number
          final_ticket_size: number
          final_valuation: number
          id?: string
          investor_fee: number
          investor_id?: string | null
          startup_fee: number
          startup_id?: string | null
          transaction_hash: string
          transfer_bank_name?: string | null
          transfer_mode?: string | null
          transfer_reference?: string | null
        }
        Update: {
          additional_terms?: string | null
          closed_at?: string
          deal_id?: string | null
          final_equity?: number
          final_ticket_size?: number
          final_valuation?: number
          id?: string
          investor_fee?: number
          investor_id?: string | null
          startup_fee?: number
          startup_id?: string | null
          transaction_hash?: string
          transfer_bank_name?: string | null
          transfer_mode?: string | null
          transfer_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_ledger_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal_negotiations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_ledger_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_ledger_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_messages: {
        Row: {
          content: string
          created_at: string | null
          deal_id: string | null
          id: string
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          deal_id?: string | null
          id?: string
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          deal_id?: string | null
          id?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal_negotiations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_negotiations: {
        Row: {
          accepted_at: string | null
          additional_terms: string | null
          ai_action_suggestions: Json | null
          bid_deck_id: string | null
          board_seats: number | null
          created_at: string | null
          deal_locked_at: string | null
          deal_maker_offer_id: string | null
          deal_structure: string | null
          funds_transferred: boolean | null
          id: string
          investor_id: string
          offer_history: Json | null
          pitch_deck_id: string
          platform_fee_investor: number | null
          platform_fee_startup: number | null
          proposed_equity: number | null
          proposed_valuation: number | null
          startup_id: string
          status: string | null
          ticket_size: number | null
          transaction_hash: string | null
          transfer_bank_name: string | null
          transfer_mode: string | null
          transfer_reference: string | null
          updated_at: string | null
          voting_rights: boolean | null
        }
        Insert: {
          accepted_at?: string | null
          additional_terms?: string | null
          ai_action_suggestions?: Json | null
          bid_deck_id?: string | null
          board_seats?: number | null
          created_at?: string | null
          deal_locked_at?: string | null
          deal_maker_offer_id?: string | null
          deal_structure?: string | null
          funds_transferred?: boolean | null
          id?: string
          investor_id: string
          offer_history?: Json | null
          pitch_deck_id: string
          platform_fee_investor?: number | null
          platform_fee_startup?: number | null
          proposed_equity?: number | null
          proposed_valuation?: number | null
          startup_id: string
          status?: string | null
          ticket_size?: number | null
          transaction_hash?: string | null
          transfer_bank_name?: string | null
          transfer_mode?: string | null
          transfer_reference?: string | null
          updated_at?: string | null
          voting_rights?: boolean | null
        }
        Update: {
          accepted_at?: string | null
          additional_terms?: string | null
          ai_action_suggestions?: Json | null
          bid_deck_id?: string | null
          board_seats?: number | null
          created_at?: string | null
          deal_locked_at?: string | null
          deal_maker_offer_id?: string | null
          deal_structure?: string | null
          funds_transferred?: boolean | null
          id?: string
          investor_id?: string
          offer_history?: Json | null
          pitch_deck_id?: string
          platform_fee_investor?: number | null
          platform_fee_startup?: number | null
          proposed_equity?: number | null
          proposed_valuation?: number | null
          startup_id?: string
          status?: string | null
          ticket_size?: number | null
          transaction_hash?: string | null
          transfer_bank_name?: string | null
          transfer_mode?: string | null
          transfer_reference?: string | null
          updated_at?: string | null
          voting_rights?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_negotiations_bid_deck_id_fkey"
            columns: ["bid_deck_id"]
            isOneToOne: false
            referencedRelation: "investor_bid_decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_negotiations_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_negotiations_pitch_deck_id_fkey"
            columns: ["pitch_deck_id"]
            isOneToOne: false
            referencedRelation: "pitch_decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_negotiations_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_offer_acceptances: {
        Row: {
          accepted_at: string
          id: string
          offer_id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          offer_id: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          offer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_offer_acceptances_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "deal_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_offer_events: {
        Row: {
          actor_id: string | null
          created_at: string
          deal_id: string
          event_data: Json
          event_type: string
          id: string
          offer_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          deal_id: string
          event_data?: Json
          event_type: string
          id?: string
          offer_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          deal_id?: string
          event_data?: Json
          event_type?: string
          id?: string
          offer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_offer_events_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal_negotiations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_offer_events_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "deal_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_offers: {
        Row: {
          created_at: string
          deal_id: string
          deal_structure: string
          id: string
          offer_number: number
          sender_id: string
          status: string
          terms: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          deal_structure?: string
          id?: string
          offer_number: number
          sender_id: string
          status?: string
          terms?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          deal_structure?: string
          id?: string
          offer_number?: number
          sender_id?: string
          status?: string
          terms?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_offers_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal_negotiations"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_pipeline: {
        Row: {
          created_at: string
          id: string
          investor_id: string
          notes: string | null
          opportunity_id: string | null
          stage: string
          startup_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          investor_id: string
          notes?: string | null
          opportunity_id?: string | null
          stage?: string
          startup_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          investor_id?: string
          notes?: string | null
          opportunity_id?: string | null
          stage?: string
          startup_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_pipeline_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "deal_pipeline_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "fundraising_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_pipeline_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      deck_ratings: {
        Row: {
          created_at: string | null
          deck_id: string
          id: string
          score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deck_id: string
          id?: string
          score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deck_id?: string
          id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      dislikes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dislikes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dislikes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraising_opportunities: {
        Row: {
          amount_raised: number
          burn_rate: number | null
          created_at: string
          description: string | null
          equity_offered: number | null
          funding_goal: number | null
          growth_rate: string | null
          id: string
          minimum_ticket: number | null
          pitch_deck_url: string | null
          revenue: number | null
          runway_months: number | null
          stage: string | null
          startup_id: string
          status: string
          title: string
          traction_summary: string | null
          updated_at: string
          use_of_funds: string | null
          valuation: number | null
        }
        Insert: {
          amount_raised?: number
          burn_rate?: number | null
          created_at?: string
          description?: string | null
          equity_offered?: number | null
          funding_goal?: number | null
          growth_rate?: string | null
          id?: string
          minimum_ticket?: number | null
          pitch_deck_url?: string | null
          revenue?: number | null
          runway_months?: number | null
          stage?: string | null
          startup_id: string
          status?: string
          title: string
          traction_summary?: string | null
          updated_at?: string
          use_of_funds?: string | null
          valuation?: number | null
        }
        Update: {
          amount_raised?: number
          burn_rate?: number | null
          created_at?: string
          description?: string | null
          equity_offered?: number | null
          funding_goal?: number | null
          growth_rate?: string | null
          id?: string
          minimum_ticket?: number | null
          pitch_deck_url?: string | null
          revenue?: number | null
          runway_months?: number | null
          stage?: string | null
          startup_id?: string
          status?: string
          title?: string
          traction_summary?: string | null
          updated_at?: string
          use_of_funds?: string | null
          valuation?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fundraising_opportunities_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      industries: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      investment_stages: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          investment_date: string | null
          investment_type: string | null
          investor_id: string
          notes: string | null
          opportunity_id: string | null
          ownership_percentage: number | null
          startup_id: string
          status: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          investment_date?: string | null
          investment_type?: string | null
          investor_id: string
          notes?: string | null
          opportunity_id?: string | null
          ownership_percentage?: number | null
          startup_id: string
          status?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          investment_date?: string | null
          investment_type?: string | null
          investor_id?: string
          notes?: string | null
          opportunity_id?: string | null
          ownership_percentage?: number | null
          startup_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "investments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "fundraising_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      investor_bid_decks: {
        Row: {
          created_at: string | null
          id: string
          investment_duration: string | null
          investment_type: string | null
          investor_id: string
          max_allocation: number
          min_arr: number | null
          min_roi: number | null
          previous_portfolios: string[] | null
          status: string | null
          target_countries: string[] | null
          target_sectors: string[] | null
          thesis: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          investment_duration?: string | null
          investment_type?: string | null
          investor_id: string
          max_allocation: number
          min_arr?: number | null
          min_roi?: number | null
          previous_portfolios?: string[] | null
          status?: string | null
          target_countries?: string[] | null
          target_sectors?: string[] | null
          thesis: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          investment_duration?: string | null
          investment_type?: string | null
          investor_id?: string
          max_allocation?: number
          min_arr?: number | null
          min_roi?: number | null
          previous_portfolios?: string[] | null
          status?: string | null
          target_countries?: string[] | null
          target_sectors?: string[] | null
          thesis?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_bid_decks_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_bid_submissions: {
        Row: {
          bid_deck_id: string
          created_at: string | null
          id: string
          pitch_deck_id: string
          startup_id: string
          status: string | null
        }
        Insert: {
          bid_deck_id: string
          created_at?: string | null
          id?: string
          pitch_deck_id: string
          startup_id: string
          status?: string | null
        }
        Update: {
          bid_deck_id?: string
          created_at?: string | null
          id?: string
          pitch_deck_id?: string
          startup_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_bid_submissions_bid_deck_id_fkey"
            columns: ["bid_deck_id"]
            isOneToOne: false
            referencedRelation: "investor_bid_decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_bid_submissions_pitch_deck_id_fkey"
            columns: ["pitch_deck_id"]
            isOneToOne: false
            referencedRelation: "pitch_decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_bid_submissions_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_interests: {
        Row: {
          created_at: string
          id: string
          investor_id: string
          message: string | null
          opportunity_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          investor_id: string
          message?: string | null
          opportunity_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          investor_id?: string
          message?: string | null
          opportunity_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_interests_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "investor_interests_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "fundraising_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_preferences: {
        Row: {
          board_involvement: string | null
          business_models: string[] | null
          created_at: string
          deal_velocity: string | null
          follow_on: boolean | null
          geographies: string[] | null
          id: string
          industries: string[] | null
          investment_types: string[] | null
          investor_id: string
          lead_investment: boolean | null
          max_ticket: number | null
          min_ticket: number | null
          preferred_stages: string[] | null
          risk_tolerance: string | null
          target_company_size: string | null
          target_operational_locations: string | null
          updated_at: string
        }
        Insert: {
          board_involvement?: string | null
          business_models?: string[] | null
          created_at?: string
          deal_velocity?: string | null
          follow_on?: boolean | null
          geographies?: string[] | null
          id?: string
          industries?: string[] | null
          investment_types?: string[] | null
          investor_id: string
          lead_investment?: boolean | null
          max_ticket?: number | null
          min_ticket?: number | null
          preferred_stages?: string[] | null
          risk_tolerance?: string | null
          target_company_size?: string | null
          target_operational_locations?: string | null
          updated_at?: string
        }
        Update: {
          board_involvement?: string | null
          business_models?: string[] | null
          created_at?: string
          deal_velocity?: string | null
          follow_on?: boolean | null
          geographies?: string[] | null
          id?: string
          industries?: string[] | null
          investment_types?: string[] | null
          investor_id?: string
          lead_investment?: boolean | null
          max_ticket?: number | null
          min_ticket?: number | null
          preferred_stages?: string[] | null
          risk_tolerance?: string | null
          target_company_size?: string | null
          target_operational_locations?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_preferences_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: true
            referencedRelation: "investor_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      investor_profiles: {
        Row: {
          assets_under_management: string | null
          created_at: string
          firm_name: string | null
          firm_type: string | null
          investment_thesis: string | null
          profile_id: string
          updated_at: string
          verification_status: string
          website: string | null
        }
        Insert: {
          assets_under_management?: string | null
          created_at?: string
          firm_name?: string | null
          firm_type?: string | null
          investment_thesis?: string | null
          profile_id: string
          updated_at?: string
          verification_status?: string
          website?: string | null
        }
        Update: {
          assets_under_management?: string | null
          created_at?: string
          firm_name?: string | null
          firm_type?: string | null
          investment_thesis?: string | null
          profile_id?: string
          updated_at?: string
          verification_status?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_views: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          viewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          viewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_views_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "fundraising_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pitch_deck_bids: {
        Row: {
          bid_amount: number
          created_at: string | null
          id: string
          investor_id: string | null
          pitch_deck_id: string | null
          status: string | null
        }
        Insert: {
          bid_amount: number
          created_at?: string | null
          id?: string
          investor_id?: string | null
          pitch_deck_id?: string | null
          status?: string | null
        }
        Update: {
          bid_amount?: number
          created_at?: string | null
          id?: string
          investor_id?: string | null
          pitch_deck_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pitch_deck_bids_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pitch_deck_bids_pitch_deck_id_fkey"
            columns: ["pitch_deck_id"]
            isOneToOne: false
            referencedRelation: "pitch_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      pitch_deck_interests: {
        Row: {
          created_at: string | null
          id: string
          investor_id: string | null
          pitch_deck_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          investor_id?: string | null
          pitch_deck_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          investor_id?: string | null
          pitch_deck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pitch_deck_interests_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pitch_deck_interests_pitch_deck_id_fkey"
            columns: ["pitch_deck_id"]
            isOneToOne: false
            referencedRelation: "pitch_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      pitch_deck_ratings: {
        Row: {
          created_at: string | null
          id: string
          investor_id: string
          pitch_deck_id: string
          score: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          investor_id: string
          pitch_deck_id: string
          score: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          investor_id?: string
          pitch_deck_id?: string
          score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pitch_deck_ratings_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pitch_deck_ratings_pitch_deck_id_fkey"
            columns: ["pitch_deck_id"]
            isOneToOne: false
            referencedRelation: "pitch_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      pitch_deck_stars: {
        Row: {
          created_at: string | null
          id: string
          investor_id: string | null
          pitch_deck_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          investor_id?: string | null
          pitch_deck_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          investor_id?: string | null
          pitch_deck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pitch_deck_stars_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pitch_deck_stars_pitch_deck_id_fkey"
            columns: ["pitch_deck_id"]
            isOneToOne: false
            referencedRelation: "pitch_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      pitch_deck_views: {
        Row: {
          created_at: string | null
          id: string
          pitch_deck_id: string
          viewer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pitch_deck_id: string
          viewer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pitch_deck_id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pitch_deck_views_pitch_deck_id_fkey"
            columns: ["pitch_deck_id"]
            isOneToOne: false
            referencedRelation: "pitch_decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pitch_deck_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pitch_decks: {
        Row: {
          business_model: string | null
          company_name: string | null
          competitors: string | null
          created_at: string | null
          deck_url: string | null
          elevator_pitch: string
          equity_offered: number | null
          funding_goal: string | null
          id: string
          market_size: string | null
          min_ticket: string | null
          problem_statement: string | null
          revenue: number | null
          runway_months: number | null
          solution: string | null
          stage: string | null
          status: string | null
          target_bid_id: string | null
          tier_required: string | null
          title: string
          traction: string | null
          updated_at: string | null
          use_of_funds: string | null
          user_id: string
          valuation: string | null
        }
        Insert: {
          business_model?: string | null
          company_name?: string | null
          competitors?: string | null
          created_at?: string | null
          deck_url?: string | null
          elevator_pitch: string
          equity_offered?: number | null
          funding_goal?: string | null
          id?: string
          market_size?: string | null
          min_ticket?: string | null
          problem_statement?: string | null
          revenue?: number | null
          runway_months?: number | null
          solution?: string | null
          stage?: string | null
          status?: string | null
          target_bid_id?: string | null
          tier_required?: string | null
          title: string
          traction?: string | null
          updated_at?: string | null
          use_of_funds?: string | null
          user_id: string
          valuation?: string | null
        }
        Update: {
          business_model?: string | null
          company_name?: string | null
          competitors?: string | null
          created_at?: string | null
          deck_url?: string | null
          elevator_pitch?: string
          equity_offered?: number | null
          funding_goal?: string | null
          id?: string
          market_size?: string | null
          min_ticket?: string | null
          problem_statement?: string | null
          revenue?: number | null
          runway_months?: number | null
          solution?: string | null
          stage?: string | null
          status?: string | null
          target_bid_id?: string | null
          tier_required?: string | null
          title?: string
          traction?: string | null
          updated_at?: string | null
          use_of_funds?: string | null
          user_id?: string
          valuation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pitch_decks_target_bid_id_fkey"
            columns: ["target_bid_id"]
            isOneToOne: false
            referencedRelation: "investor_bid_decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pitch_decks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          viewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          viewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          company_name: string | null
          cookie_consent_at: string | null
          cookie_consent_choice: string | null
          country: string | null
          created_at: string
          dob: string | null
          elevator_pitch: string | null
          email: string | null
          firm_details: string | null
          funding_goal: string | null
          gender: string | null
          id: string
          industries_of_interest: string[] | null
          industry: string | null
          interested_in: string | null
          interested_market: string | null
          investment_thesis: string | null
          linkedin_url: string | null
          nickname: string | null
          ownership_type: string | null
          phone: string | null
          pitch_deck_url: string | null
          preferred_stages: string[] | null
          presence_status: string | null
          profile_completed: boolean | null
          role: string
          services_offering: string | null
          stage: string | null
          state: string | null
          terms_accepted_at: string | null
          terms_version: string | null
          ticket_size: string | null
          tier: string | null
          timezone: string | null
          traction: string | null
          twitter_url: string | null
          updated_at: string
          username: string | null
          valuation: number | null
          visibility: string | null
          website: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          cookie_consent_at?: string | null
          cookie_consent_choice?: string | null
          country?: string | null
          created_at?: string
          dob?: string | null
          elevator_pitch?: string | null
          email?: string | null
          firm_details?: string | null
          funding_goal?: string | null
          gender?: string | null
          id: string
          industries_of_interest?: string[] | null
          industry?: string | null
          interested_in?: string | null
          interested_market?: string | null
          investment_thesis?: string | null
          linkedin_url?: string | null
          nickname?: string | null
          ownership_type?: string | null
          phone?: string | null
          pitch_deck_url?: string | null
          preferred_stages?: string[] | null
          presence_status?: string | null
          profile_completed?: boolean | null
          role?: string
          services_offering?: string | null
          stage?: string | null
          state?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          ticket_size?: string | null
          tier?: string | null
          timezone?: string | null
          traction?: string | null
          twitter_url?: string | null
          updated_at?: string
          username?: string | null
          valuation?: number | null
          visibility?: string | null
          website?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          cookie_consent_at?: string | null
          cookie_consent_choice?: string | null
          country?: string | null
          created_at?: string
          dob?: string | null
          elevator_pitch?: string | null
          email?: string | null
          firm_details?: string | null
          funding_goal?: string | null
          gender?: string | null
          id?: string
          industries_of_interest?: string[] | null
          industry?: string | null
          interested_in?: string | null
          interested_market?: string | null
          investment_thesis?: string | null
          linkedin_url?: string | null
          nickname?: string | null
          ownership_type?: string | null
          phone?: string | null
          pitch_deck_url?: string | null
          preferred_stages?: string[] | null
          presence_status?: string | null
          profile_completed?: boolean | null
          role?: string
          services_offering?: string | null
          stage?: string | null
          state?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          ticket_size?: string | null
          tier?: string | null
          timezone?: string | null
          traction?: string | null
          twitter_url?: string | null
          updated_at?: string
          username?: string | null
          valuation?: number | null
          visibility?: string | null
          website?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          consent_level: string | null
          created_at: string
          id: string
          user_agent: string | null
        }
        Insert: {
          consent_level?: string | null
          created_at?: string
          id?: string
          user_agent?: string | null
        }
        Update: {
          consent_level?: string | null
          created_at?: string
          id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      startup_metrics: {
        Row: {
          created_at: string
          id: string
          metric_period: string | null
          metric_type: string
          metric_value: number
          startup_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_period?: string | null
          metric_type: string
          metric_value: number
          startup_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_period?: string | null
          metric_type?: string
          metric_value?: number
          startup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "startup_metrics_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      startup_profiles: {
        Row: {
          business_model: string | null
          company_name: string | null
          company_size: string | null
          created_at: string
          current_arr: number | null
          description: string | null
          employee_count: string | null
          founded_year: number | null
          headquarters: string | null
          industry: string | null
          monthly_burn: number | null
          operational_costs: number | null
          operational_locations: string | null
          profile_id: string
          runway_months: number | null
          target_exit: string | null
          technical_moat: string | null
          updated_at: string
          verification_status: string
          website: string | null
        }
        Insert: {
          business_model?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          current_arr?: number | null
          description?: string | null
          employee_count?: string | null
          founded_year?: number | null
          headquarters?: string | null
          industry?: string | null
          monthly_burn?: number | null
          operational_costs?: number | null
          operational_locations?: string | null
          profile_id: string
          runway_months?: number | null
          target_exit?: string | null
          technical_moat?: string | null
          updated_at?: string
          verification_status?: string
          website?: string | null
        }
        Update: {
          business_model?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          current_arr?: number | null
          description?: string | null
          employee_count?: string | null
          founded_year?: number | null
          headquarters?: string | null
          industry?: string | null
          monthly_burn?: number | null
          operational_costs?: number | null
          operational_locations?: string | null
          profile_id?: string
          runway_months?: number | null
          target_exit?: string | null
          technical_moat?: string | null
          updated_at?: string
          verification_status?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_team: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          is_founder: boolean
          profile_id: string | null
          startup_id: string
          title: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          is_founder?: boolean
          profile_id?: string | null
          startup_id: string
          title?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          is_founder?: boolean
          profile_id?: string | null
          startup_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_team_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_team_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_deal_offer: { Args: { p_offer_id: string }; Returns: Json }
      create_deal_offer: {
        Args: { p_deal_id: string; p_deal_structure: string; p_terms: Json }
        Returns: {
          created_at: string
          deal_id: string
          deal_structure: string
          id: string
          offer_number: number
          sender_id: string
          status: string
          terms: Json
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "deal_offers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      finalize_deal: {
        Args: {
          p_deal_id: string
          p_eq: number
          p_terms: string
          p_ticket: number
          p_val: number
        }
        Returns: Json
      }
      get_user_role: { Args: { p_user_id: string }; Returns: string }
      get_user_tier: { Args: { p_user_id: string }; Returns: string }
      lock_permanent_deal:
        | {
            Args: { p_deal_id: string; p_funds_transferred: boolean }
            Returns: Json
          }
        | {
            Args: {
              p_bank_name?: string
              p_deal_id: string
              p_funds_transferred: boolean
              p_transfer_mode?: string
              p_transfer_ref?: string
            }
            Returns: Json
          }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
