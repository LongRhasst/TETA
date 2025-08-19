import { Injectable } from '@nestjs/common';
import { ChannelMessage } from 'mezon-sdk';
import { KomuPreferences, KomuOutputData, MessageType } from '../types/komu.types';

@Injectable()
export class KomuParserService {
  /**
   * Determine message type based on content and references
   */
  determineMessageType(message: ChannelMessage): MessageType {
    const isReply = Array.isArray(message.references) && message.references.length > 0;
    const isUpdate = message.code === 1;
    
    return isReply ? 'reply' : isUpdate ? 'update' : 'unknown';
  }

  /**
   * Check if message is from KOMU and related to daily activity
   */
  isKomuDailyActivity(message: ChannelMessage): boolean {
    const content = this.getMessageContent(message);
    const isKomu = this.isFromKomu(message);
    
    // Parse referenced content if present
    let refText = '';
    const isReply = Array.isArray(message.references) && message.references.length > 0;
    if (isReply) {
      const raw = message.references?.[0]?.content ?? '';
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          refText = typeof parsed?.t === 'string' ? parsed.t : raw;
        } catch {
          refText = raw;
        }
      }
    }

    const hasDailyInContent = /\*daily\b/i.test(content);
    const looksLikeDailyUpdate = /(daily saved|\bdate:|\byesterday:|\btoday:|\bblock:|\bworking\s*time:)/i.test(content);
    const hasDailyInRef = /\*daily\b/i.test(refText);

    return isKomu && (hasDailyInContent || looksLikeDailyUpdate || (isReply && hasDailyInRef));
  }

  /**
   * Extract preferences from reply message
   */
  extractPreferences(message: ChannelMessage): KomuPreferences {
    const preferences: any = {};
    
    try {
      const embed = (message as any)?.content?.embed?.[0];
      if (embed?.fields) {
        embed.fields.forEach((field: any) => {
          if (field.inputs) {
            const fieldName = field.name.replace(':', '').toLowerCase().trim();
            if (field.inputs.component?.valueSelected) {
              preferences[fieldName] = {
                label: field.inputs.component.valueSelected.label,
                value: field.inputs.component.valueSelected.value
              };
            } else if (field.inputs.component?.defaultValue !== undefined) {
              preferences[fieldName] = field.inputs.component.defaultValue;
            }
          }
        });
      }
    } catch (error) {
      console.error('Error extracting preferences:', error);
    }
    
    return preferences;
  }

  /**
   * Extract output data from update message
   */
  extractOutputData(content: string): KomuOutputData {
    const outputData: any = {};
    const lines = content.split('\n');
    
    lines.forEach((line: string) => {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const key = match[1].toLowerCase().trim();
        const value = match[2].trim();
        
        // Convert date string to DateTime for database storage
        if (key === 'date') {
          outputData[key] = this.parseDateString(value);
        } else {
          outputData[key] = value;
        }
      }
    });
    
    return outputData;
  }

  /**
   * Extract message sender username from references
   */
  extractSenderUsername(message: ChannelMessage): string | undefined {
    return message.references?.[0]?.message_sender_username;
  }

  /**
   * Get message content in consistent format
   */
  getMessageContent(message: ChannelMessage): string {
    return typeof (message as any)?.content === 'string'
      ? (message as any).content
      : message?.content?.t ?? '';
  }

  /**
   * Check if message is from KOMU
   */
  private isFromKomu(message: ChannelMessage): boolean {
    return message.username?.toUpperCase?.() === 'KOMU' ||
           message.display_name?.toUpperCase?.() === 'KOMU';
  }

  /**
   * Parse date string from format "DD/MM/YYYY" to DateTime
   */
  private parseDateString(dateStr: string): Date | null {
    try {
      // Expected format: "18/08/2025"
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in Date constructor
        const year = parseInt(parts[2], 10);
        
        const date = new Date(year, month, day);
        
        // Validate the date
        if (date.getFullYear() === year && 
            date.getMonth() === month && 
            date.getDate() === day) {
          return date;
        }
      }
      
      console.warn(`Invalid date format: ${dateStr}`);
      return null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }
}
