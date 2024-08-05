import { DappRequestSchema } from 'src/app/features/dappRequests/types/DappRequestTypes'
import { MessageSchema } from 'src/background/messagePassing/messageTypes'
import { z } from 'zod'

// ENUMS

// Requests from content scripts to the extension (non-dapp requests)
export enum ContentScriptUtilityMessageType {
  FocusOnboardingTab = 'FocusOnboardingTab',
  ErrorLog = 'Error',
  InfoLog = 'Info',
}

export const ErrorLogSchema = MessageSchema.extend({
  type: z.literal(ContentScriptUtilityMessageType.ErrorLog),
  message: z.string(),
  fileName: z.string(),
  functionName: z.string(),
  tags: z.record(z.string()).optional(),
})
export type ErrorLog = z.infer<typeof ErrorLogSchema>

export const InfoLogSchema = MessageSchema.extend({
  type: z.literal(ContentScriptUtilityMessageType.InfoLog),
  fileName: z.string(),
  functionName: z.string(),
  message: z.string(),
  tags: z.record(z.string()),
})
export type InfoLog = z.infer<typeof InfoLogSchema>

export const FocusOnboardingMessageSchema = MessageSchema.extend({
  type: z.literal(ContentScriptUtilityMessageType.FocusOnboardingTab),
})
export type FocusOnboardingMessage = z.infer<typeof FocusOnboardingMessageSchema>

// Requests from background script to the extension sidebar
export enum BackgroundToSidePanelRequestType {
  TabActivated = 'TabActivated',
  DappRequestReceived = 'DappRequestReceived',
}

export const DappRequestMessageSchema = z.object({
  type: z.literal(BackgroundToSidePanelRequestType.DappRequestReceived),
  dappRequest: DappRequestSchema,
  senderTabInfo: z.object({
    id: z.number(),
    url: z.string(),
    favIconUrl: z.string().optional(),
  }),
  isSidebarClosed: z.optional(z.boolean()),
})
export type DappRequestMessage = z.infer<typeof DappRequestMessageSchema>

export const TabActivatedRequestSchema = MessageSchema.extend({
  type: z.literal(BackgroundToSidePanelRequestType.TabActivated),
})
export type TabActivatedRequest = z.infer<typeof TabActivatedRequestSchema>

// Requests outgoing from the extension to the injected script
export enum ExtensionToDappRequestType {
  UpdateConnections = 'UpdateConnections',
  SwitchChain = 'SwitchChain',
}

const BaseExtensionRequestSchema = MessageSchema.extend({
  type: z.nativeEnum(ExtensionToDappRequestType),
})
export type BaseExtensionRequest = z.infer<typeof BaseExtensionRequestSchema>

export const ExtensionChainChangeSchema = BaseExtensionRequestSchema.extend({
  type: z.literal(ExtensionToDappRequestType.SwitchChain),
  chainId: z.string(),
  providerUrl: z.string(),
})
export type ExtensionChainChange = z.infer<typeof ExtensionChainChangeSchema>

export const UpdateConnectionRequestSchema = BaseExtensionRequestSchema.extend({
  type: z.literal(ExtensionToDappRequestType.UpdateConnections),
  addresses: z.array(z.string()), // TODO (Thomas): Figure out what to do for type safety here
})
export type UpdateConnectionRequest = z.infer<typeof UpdateConnectionRequestSchema>

export const ExtensionToDappRequestSchema = z.union([
  ExtensionChainChangeSchema,
  UpdateConnectionRequestSchema,
])
export type ExtensionToDappRequest = z.infer<typeof ExtensionToDappRequestSchema>

// VALIDATORS

export function isValidExtensionToDappRequest(request: unknown): request is ExtensionToDappRequest {
  return ExtensionToDappRequestSchema.safeParse(request).success
}
