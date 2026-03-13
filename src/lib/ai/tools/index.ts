import { BusinessContext } from '../context-builder'
import { getServicesTool } from './get-services'
import { getPricingTool } from './get-pricing'
import { getHoursTool } from './get-hours'
import { getFaqsTool } from './get-faqs'
import { checkAvailabilityTool } from './check-availability'
import { requestApprovalTool } from './request-approval'
import { SupabaseClient } from '@supabase/supabase-js'

export function getCustomerTools(
  context: BusinessContext,
  supabase?: SupabaseClient,
  tenantId?: string,
  conversationId?: string,
  clientId?: string
) {
  const tools: Record<string, any> = {
    getServices: getServicesTool(context),
    getPricing: getPricingTool(context),
    getHours: getHoursTool(context),
    getFaqs: getFaqsTool(context),
    checkAvailability: checkAvailabilityTool(context),
  }

  if (supabase && tenantId && conversationId) {
    tools.requestApproval = requestApprovalTool(supabase, tenantId, conversationId, clientId)
  }

  return tools
}

export function getOwnerTools(
  context: BusinessContext,
  supabase?: SupabaseClient,
  tenantId?: string,
  conversationId?: string
) {
  return {
    ...getCustomerTools(context),
    // Owner-specific tools added in Phase 3
  }
}
