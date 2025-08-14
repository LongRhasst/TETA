import { Injectable, Logger, Inject } from '@nestjs/common';

import {
  ApiMessageReaction,
  MezonClient,
  Events,
  ChannelMessage,
  ChannelCreatedEvent,
  ChannelDeletedEvent,
  ChannelUpdatedEvent,
  UserChannelAddedEvent,
  UserClanRemovedEvent,
  TokenSentEvent,
} from 'mezon-sdk';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessageButtonClicked } from 'mezon-sdk/dist/cjs/rtapi/realtime';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject('MEZON') private readonly client: MezonClient,
  ) {}

  async initEvent() {
    this.logger.log('Initializing Mezon bot events...');
    
    // Register event listeners using official mezon-sdk methods
    await this.client.onChannelMessage(this.handlechannelmessage);
    this.client.onMessageReaction(this.handlemessagereaction);
    this.client.onChannelCreated(this.handlechannelcreated);
    this.client.onUserClanRemoved(this.handleuserclanremoved);
    this.client.onUserChannelAdded(this.handleuserchanneladded);
    this.client.onChannelDeleted(this.handlechanneldeleted);
    this.client.onChannelUpdated(this.handlechannelupdated);
    this.client.onAddClanUser(this.handleaddclanuser);
    this.client.onMessageButtonClicked(this.handlemessagebuttonclicked);
    
    this.logger.log('Mezon bot events initialized successfully');
  }
  // processMessage(msg: ChannelMessage) {}

  /* cspell:words handlemessagereaction */
  handlemessagereaction = async (msg: ApiMessageReaction) => {
    console.log('message reaction event');
    this.eventEmitter.emit(Events.MessageReaction, msg);
  };

  /* cspell:words handlechannelcreated */
  handlechannelcreated = async (channel: ChannelCreatedEvent) => {
    console.log('channel created event', channel);
    this.eventEmitter.emit(Events.ChannelCreated, channel);
  };

  /* cspell:words handleuserclanremoved */
  handleuserclanremoved = async (user: UserClanRemovedEvent) => {
    console.log('user clan removed event', user);
    this.eventEmitter.emit(Events.UserClanRemoved, user);
  };

  /* cspell:words handlerole */
  handlerole = async (msg) => {
    console.log('role event', msg);
  };

  /* cspell:words handleroleassign */
  handleroleassign = async (msg) => {
    console.log('role event assign', msg);
  };

  /* cspell:words handleuserchanneladded */
  handleuserchanneladded = async (user: UserChannelAddedEvent) => {
    console.log('user channel added event', user);
    this.eventEmitter.emit(Events.UserChannelAdded, user);
  };

  /* cspell:words handlechanneldeleted */
  handlechanneldeleted = async (channel: ChannelDeletedEvent) => {
    console.log('channel deleted event', channel);
    this.eventEmitter.emit(Events.ChannelDeleted, channel);
  };

  /* cspell:words handlechannelupdated */
  handlechannelupdated = async (channel: ChannelUpdatedEvent) => {
    console.log('channel updated event', channel);
    this.eventEmitter.emit(Events.ChannelUpdated, channel);
  };
  
  /* cspell:words handleaddclanuser */
  handleaddclanuser = async (data) => {
    console.log('add clan user event', data);
    this.eventEmitter.emit(Events.AddClanUser, data);
  };

  /* cspell:words handleroleassigned */
  handleroleassigned = async (msg) => {
    console.log('role assigned event', msg);
  };

  /* cspell:words handlemessagebuttonclicked */
  handlemessagebuttonclicked = (data) => {
    this.eventEmitter.emit(Events.MessageButtonClicked, data);
  };

  /* cspell:words handlechannelmessage */
  handlechannelmessage = async (msg: ChannelMessage) => {
    // Keep events minimal; downstream listeners will filter further
    ['attachments', 'mentions', 'references'].forEach((key) => {
      if (!Array.isArray(msg[key])) msg[key] = [];
    });
    this.eventEmitter.emit(Events.ChannelMessage, msg);
  };
}