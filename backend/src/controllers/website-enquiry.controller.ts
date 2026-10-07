import type { Context } from 'hono'
import type { AppEnv } from '../db'
import type { CreateWebsiteEnquiryInput } from '../zod/website-enquiry'

/**
 * Public Endpoint to submit a website enquiry
 * Endpoint: POST /v1/website/enquiry
 */
export const createWebsiteEnquiryController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<CreateWebsiteEnquiryInput>()

  if (!body.fullName || !body.mobileNo || !body.email || !body.propertyType || !body.preferredLocation || !body.estimatedBudgetBand) {
    return c.json(
      {
        success: false,
        error: 'Missing required enquiry fields',
        code: 'VALIDATION_ERROR',
      },
      400
    )
  }

  const enquiry = await prisma.websiteEnquiry.create({
    data: {
      fullName: body.fullName.trim(),
      mobileNo: body.mobileNo.trim(),
      email: body.email.trim().toLowerCase(),
      propertyType: body.propertyType.trim(),
      preferredLocation: body.preferredLocation.trim(),
      estimatedBudgetBand: body.estimatedBudgetBand.trim(),
      specificRequirements: body.specificRequirements?.trim() || null,
      status: 'NEW',
    },
  })

  return c.json(
    {
      success: true,
      message: 'Your enquiry has been submitted successfully. Our team will contact you shortly.',
      enquiry,
    },
    201
  )
}
