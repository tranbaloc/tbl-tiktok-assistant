import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { TiktokLiveManagerService } from './tiktok-live.service';
import { LiveSession } from './entities/live-session.entity';
import { LiveChatMessage } from './entities/live-chat-message.entity';
import { LiveChannel } from './entities/live-channel.entity';
import { LiveGift } from './entities/live-gift.entity';

class ConnectRequestDto {
  username?: string;
}

@ApiTags('tiktok')
@Controller('tiktok')
export class TiktokLiveController {
  constructor(private readonly tiktokLiveService: TiktokLiveManagerService) {}

  @Get('status')
  @ApiOkResponse({
    description: 'Current TikTok LIVE connection status',
  })
  getStatus() {
    return this.tiktokLiveService.getStatus();
  }

  @Post('connections')
  @ApiBody({ type: ConnectRequestDto })
  @ApiOkResponse({ description: 'Connect to a TikTok LIVE by username' })
  connect(@Body() body: ConnectRequestDto) {
    return this.tiktokLiveService.connect(body.username);
  }

  @Delete('connections/:username')
  @ApiParam({ name: 'username', required: true })
  @ApiOkResponse({ description: 'Disconnect from a TikTok LIVE by username' })
  disconnect(@Param('username') username: string) {
    return this.tiktokLiveService.disconnect(username);
  }

  @Get('connections')
  @ApiOkResponse({ description: 'List active TikTok LIVE connections' })
  listConnections() {
    return this.tiktokLiveService.listConnections();
  }

  @Get('sessions')
  @ApiOkResponse({
    description: 'List of live sessions',
    type: [LiveSession],
  })
  getSessions() {
    return this.tiktokLiveService.getSessions();
  }

  @Get('sessions/:id/chats')
  @ApiOkResponse({
    description: 'Chat messages for a live session',
    type: [LiveChatMessage],
  })
  getSessionChats(@Param('id') id: string) {
    return this.tiktokLiveService.getSessionChats(id);
  }

  @Get('sessions/:id/gifts')
  @ApiOkResponse({
    description: 'Gifts for a live session',
    type: [LiveGift],
  })
  getSessionGifts(@Param('id') id: string) {
    return this.tiktokLiveService.getSessionGifts(id);
  }

  @Get('gifts')
  @ApiOkResponse({
    description: 'List of all gifts',
    type: [LiveGift],
  })
  getGifts() {
    return this.tiktokLiveService.getGifts();
  }

  @Get('channels')
  @ApiOkResponse({
    description: 'List of TikTok channels being monitored',
    type: [LiveChannel],
  })
  getChannels() {
    return this.tiktokLiveService.getChannels();
  }
}
