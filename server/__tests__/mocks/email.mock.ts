import { vi } from "vitest";

export const mockEmailService = {
  sendVerificationEmail: vi.fn(async () => true),
  sendPasswordResetEmail: vi.fn(async () => true),
  sendWelcomeEmail: vi.fn(async () => true),
  sendPlatformUpdateEmail: vi.fn(async () => true),
  sendNewAppNotification: vi.fn(async () => true),
};

export function resetEmailMocks() {
  mockEmailService.sendVerificationEmail.mockClear();
  mockEmailService.sendPasswordResetEmail.mockClear();
  mockEmailService.sendWelcomeEmail.mockClear();
  mockEmailService.sendPlatformUpdateEmail.mockClear();
  mockEmailService.sendNewAppNotification.mockClear();
}
