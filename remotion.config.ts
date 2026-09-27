/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
// 帧图用无损 PNG，杜绝 JPEG 量化在小字边缘产生逐帧振铃；
// CRF 16 给暗部渐变与细线留足码率余量，避免播放时字边闪烁。
Config.setVideoImageFormat("png");
Config.setCrf(16);
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);
