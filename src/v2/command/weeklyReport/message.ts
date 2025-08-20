import { ChannelMessageContent, EMarkdownType } from 'mezon-sdk';

export function generateChannelMessageContent({
    message,
    blockMessage,
}:{
    message: string;
    blockMessage?: boolean;
}): ChannelMessageContent {
    return {
        t: message,
        mk: blockMessage ?? false ? [{ type: EMarkdownType.PRE, s: 0, e: message.length }] : [],
    }
}