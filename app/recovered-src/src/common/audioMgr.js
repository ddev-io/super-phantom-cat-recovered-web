// Recovered first-pass JS from C:/Users/denis/Downloads/Super_Cat_v1.162_base_src/recovered-src/dis-samples/dis/common/audioMgr.dis
var vee = vee || {};
vee.Audio = {
  event: {
    popLayer: "res/sfx_menu_openwindow.mp3",
    closeLayer: "res/sfx_menu_closewindow.mp3",
    button: "res/sfx_menu_buttonclick.mp3"
  },
  lastBGM: null,
  currentBGID: -1,
  _isMusicPause: false,
  _isMusicStopped: false,
  addEventEffect: function (arg0, arg1) {
    this.event[arg0] = arg1;
  },
  addEvents: function (arg0) {
    for (var local0 in arg0) {
      this.event[local0] = arg0[local0];
    }
  },
  preload: function () {
    var local0 = arguments[0];
    var local1 = arguments[1];
    if (!local1) {
      local1 = function (arg0) {
        if (!arg0) {
          vee.Audio.preload(local0, local1);
        }
      };
    }
    jsb.AudioEngine.preload(local0, local1);
  },
  onEvent: function (arg0, arg1) {
    var local0 = this.event[arg0];
    if (local0) {
      if (_.isArray(local0)) {
        var local1 = vee.Utils.randomInt(0, local0.length - 1);
        return this.playEffect(local0[local1], arg1);
      }
      return this.playEffect(local0, arg1);
    }
  },
  playEffect: function (arg0, arg1) {
    if (!this.soundEnabled) {
      return null;
    }
    return jsb.AudioEngine.play2d(arg0, arg1);
  },
  stopEffect: function () {
  },
  stopAllEffcts: function () {
    jsb.AudioEngine.stopAll();
    this._isMusicStopped = true;
  },
  pauseAllEffects: function () {
    jsb.AudioEngine.pauseAll();
    if (this.musicEnabled && !this._isMusicPause) {
      jsb.AudioEngine.resume(this.currentBGID);
    }
  },
  resumeAllEffects: function () {
    jsb.AudioEngine.resumeAll();
    if (this.musicEnabled && this._isMusicPause) {
      jsb.AudioEngine.pause(this.currentBGID);
    }
  },
  playMusic: function (arg0) {
    if (this.currentBGID != -1) {
      vee.Audio.stopMusic();
    }
    this.lastBGM = arg0;
    if (!this.musicEnabled) {
      return undefined;
    }
    this.currentBGID = jsb.AudioEngine.play2d(arg0, true);
  },
  getLastMusic: function () {
    return this.lastBGM;
  },
  playLastMusic: function () {
    if (!this.musicEnabled) {
      return undefined;
    }
    if (this.lastBGM) {
      if (this.currentBGID != -1) {
        jsb.AudioEngine.stop(this.currentBGID);
      }
      cc.log("zq debug play last music====" + this.lastBGM);
      this.currentBGID = jsb.AudioEngine.play2d(this.lastBGM, true);
    }
  },
  stopMusic: function () {
    this.lastBGM = undefined;
    jsb.AudioEngine.stop(this.currentBGID);
    this.currentBGID = -1;
  },
  stopMusicWithSave: function () {
    jsb.AudioEngine.stop(this.currentBGID);
  },
  pauseMusic: function () {
    jsb.AudioEngine.pause(this.currentBGID);
  },
  resumeMusic: function () {
    if (this._isMusicStopped) {
      this.playLastMusic();
      this._isMusicStopped = false;
    } else {
      jsb.AudioEngine.resume(this.currentBGID);
    }
  },
  pause: function () {
    this._isMusicPause = true;
    jsb.AudioEngine.pauseAll();
  },
  resume: function () {
    this._isMusicPause = false;
    jsb.AudioEngine.resumeAll();
  },
  musicEnabled: true,
  soundEnabled: true,
  setMusicEnabled: function (arg0) {
    this.musicEnabled = arg0;
    vee.data.musicEnabled = arg0;
    if (!arg0) {
      this.stopMusicWithSave();
    } else if (!this._isMusicPause) {
      this.playLastMusic();
    }
  },
  setSoundEnabled: function (arg0) {
    this.soundEnabled = arg0;
    vee.data.soundEnabled = arg0;
    if (!arg0) {
      this.stopAllEffcts();
    }
    var local0 = vee.Common.getInstance();
    cc.log("enable : " + arg0);
    local0.setSoundEnabled(arg0);
  },
  init: function () {
    this.musicEnabled = vee.data.musicEnabled;
    this.soundEnabled = vee.data.soundEnabled;
    var local0 = vee.Common.getInstance();
    local0.setSoundEnabled(this.soundEnabled);
    if (!(typeof window !== "undefined" && window.__supercatSkipAudioStartupPreload) &&
        VERSION.IOS_FREE_CN != game.Data.version.curVersion) {
      this.preloadAudio();
    }
  },
  _audioCachePool: null,
  _audioAllCacheNum: 0,
  _maxPreloadNum: 5,
  _curPreloadNum: 0,
  _curEndloadNum: 0,
  pushAudioCache: function (arg0) {
    this._audioCachePool.push(arg0);
  },
  startPreloadAudio: function () {
    var localCallback = arguments[0];
    var local0 = this._audioCachePool.shift();
    if (!local0) {
      return;
    }
    var local1 = this._audioCachePool.length;
    var local2 = (this._audioAllCacheNum - local1) / (this._audioAllCacheNum + 1) * 100;
    if (game.Data.oLvLoadingCtl) {
      game.Data.oLvLoadingCtl.setPercent(parseInt(local2));
    }
    vee.Utils.scheduleOnce(function () {
      this.preload(local0, function () {
        this._curPreloadNum++;
        if (this._curPreloadNum >= this._audioAllCacheNum && localCallback) {
          localCallback();
        }
      }.bind(this));
      this.startPreloadAudio(localCallback);
    }.bind(this));
  },
  preloadAllSound: function () {
    this._audioCachePool = [];
    this.pushAudioCache(res._inGame_function_win_mp3);
    this.pushAudioCache(res.efx_dog_bark_mp3);
    this.pushAudioCache(res.inGame_action_bomb_mp3);
    this.pushAudioCache(res.inGame_action_bullet_mp3);
    this.pushAudioCache(res.inGame_action_jump_mp3);
    this.pushAudioCache(res.inGame_action_smash_mp3);
    this.pushAudioCache(res.inGame_action_smashOver_mp3);
    this.pushAudioCache(res.inGame_action_smashStart__mp3);
    this.pushAudioCache(res.inGame_action_teleport_mp3);
    this.pushAudioCache(res.inGame_character_bearFear_1_mp3);
    this.pushAudioCache(res.inGame_character_bearFear_2_mp3);
    this.pushAudioCache(res.inGame_character_cop_1_mp3);
    this.pushAudioCache(res.inGame_character_cop_2_mp3);
    this.pushAudioCache(res.inGame_character_flashEyes_1_mp3);
    this.pushAudioCache(res.inGame_character_flashEyes_2_mp3);
    this.pushAudioCache(res.inGame_character_flashEyes_3_mp3);
    this.pushAudioCache(res.inGame_character_hermione_1_mp3);
    this.pushAudioCache(res.inGame_character_hermione_2_mp3);
    this.pushAudioCache(res.inGame_character_kevo_1_mp3);
    this.pushAudioCache(res.inGame_character_kevo_2_mp3);
    this.pushAudioCache(res.inGame_character_littleDown_mp3);
    this.pushAudioCache(res.inGame_character_littleDrop_mp3);
    this.pushAudioCache(res.inGame_character_littleEscape_mp3);
    this.pushAudioCache(res.inGame_character_littleShock_mp3);
    this.pushAudioCache(res.inGame_character_littleWalk_mp3);
    this.pushAudioCache(res.inGame_character_m_42_1_mp3);
    this.pushAudioCache(res.inGame_character_m_42_2_mp3);
    this.pushAudioCache(res.inGame_character_phantom_1_mp3);
    this.pushAudioCache(res.inGame_character_phantom_2_mp3);
    this.pushAudioCache(res.inGame_character_spaceman_1_mp3);
    this.pushAudioCache(res.inGame_character_spaceman_2_mp3);
    this.pushAudioCache(res.inGame_character_tiny_1_mp3);
    this.pushAudioCache(res.inGame_character_tiny_2_mp3);
    this.pushAudioCache(res.inGame_character_vampire_1_mp3);
    this.pushAudioCache(res.inGame_character_vampire_2_mp3);
    this.pushAudioCache(res.inGame_efx_blockBomb_multi_mp3);
    this.pushAudioCache(res.inGame_efx_blockBomb_single_mp3);
    this.pushAudioCache(res.inGame_efx_blockBreak_mp3);
    this.pushAudioCache(res.inGame_efx_blockBreak_1_mp3);
    this.pushAudioCache(res.inGame_efx_blockBreak_2_mp3);
    this.pushAudioCache(res.inGame_efx_blockBreak_3_mp3);
    this.pushAudioCache(res.inGame_efx_blockBreak_4_mp3);
    this.pushAudioCache(res.inGame_efx_blockUnmove_mp3);
    this.pushAudioCache(res.inGame_efx_bombCount_mp3);
    this.pushAudioCache(res.inGame_efx_bombExplode_mp3);
    this.pushAudioCache(res.inGame_efx_bubbleVanish_mp3);
    this.pushAudioCache(res.inGame_efx_coinGenerate_mp3);
    this.pushAudioCache(res.inGame_efx_coinListGenerate_mp3);
    this.pushAudioCache(res.inGame_efx_entrance_mp3);
    this.pushAudioCache(res.inGame_efx_exit_mp3);
    this.pushAudioCache(res.inGame_efx_fire_mp3);
    this.pushAudioCache(res.inGame_efx_hideLight_mp3);
    this.pushAudioCache(res.inGame_efx_invisibleStart_mp3);
    this.pushAudioCache(res.inGame_efx_showCourseText_mp3);
    this.pushAudioCache(res.inGame_efx_showLight_mp3);
    this.pushAudioCache(res.inGame_efx_showText_mp3);
    this.pushAudioCache(res.inGame_efx_spring_mp3);
    this.pushAudioCache(res.inGame_event_applause_mp3);
    this.pushAudioCache(res.inGame_event_blockMove_mp3);
    this.pushAudioCache(res.inGame_event_contact_mp3);
    this.pushAudioCache(res.inGame_event_countDown_mp3);
    this.pushAudioCache(res.inGame_event_deathInstant_mp3);
    this.pushAudioCache(res.inGame_event_deathMonster_mp3);
    this.pushAudioCache(res.inGame_event_deathMonster_1_mp3);
    this.pushAudioCache(res.inGame_event_deathMonster_2_mp3);
    this.pushAudioCache(res.inGame_event_deathMonster_3_mp3);
    this.pushAudioCache(res.inGame_event_deathMonster_4_mp3);
    this.pushAudioCache(res.inGame_event_deathMonster_5_mp3);
    this.pushAudioCache(res.inGame_event_deathMonster_6_mp3);
    this.pushAudioCache(res.inGame_event_deathNoLife_mp3);
    this.pushAudioCache(res.inGame_event_fulfillLife_mp3);
    this.pushAudioCache(res.inGame_event_hitBlock_mp3);
    this.pushAudioCache(res.inGame_event_hitEnemy_mp3);
    this.pushAudioCache(res.inGame_event_hurted_mp3);
    this.pushAudioCache(res.inGame_event_machineAppear_mp3);
    this.pushAudioCache(res.inGame_event_maskOff_mp3);
    this.pushAudioCache(res.inGame_event_relayReach_mp3);
    this.pushAudioCache(res.inGame_event_switchOff_mp3);
    this.pushAudioCache(res.inGame_event_switchOn_mp3);
    this.pushAudioCache(res.inGame_event_toGround_mp3);
    this.pushAudioCache(res.inGame_function_allCoinsGotten_mp3);
    this.pushAudioCache(res.inGame_function_bonusEntrance_mp3);
    this.pushAudioCache(res.inGame_function_countCoins_mp3);
    this.pushAudioCache(res.inGame_function_lose_mp3);
    this.pushAudioCache(res.inGame_function_star_mp3);
    this.pushAudioCache(res.inGame_function_unlockAvator_mp3);
    this.pushAudioCache(res.inGame_function_win_mp3);
    this.pushAudioCache(res.inGame_function_winStar1_mp3);
    this.pushAudioCache(res.inGame_function_winStar2_mp3);
    this.pushAudioCache(res.inGame_function_winStar3_mp3);
    this.pushAudioCache(res.inGame_menu_click_mp3);
    this.pushAudioCache(res.inGame_menu_hidePausePage_mp3);
    this.pushAudioCache(res.inGame_menu_showMessage_mp3);
    this.pushAudioCache(res.inGame_menu_showPausePage_mp3);
    this.pushAudioCache(res.inGame_monster_crazyFound_mp3);
    this.pushAudioCache(res.inGame_monster_crazyRush_mp3);
    this.pushAudioCache(res.inGame_monster_enterCannon_mp3);
    this.pushAudioCache(res.inGame_monster_jumpSlimeDown_mp3);
    this.pushAudioCache(res.inGame_monster_launchCannon_mp3);
    this.pushAudioCache(res.inGame_monster_rotateCannon_mp3);
    this.pushAudioCache(res.inGame_monster_spikeExtend_mp3);
    this.pushAudioCache(res.inGame_monster_spikeRevoke_mp3);
    this.pushAudioCache(res.inGame_pick_bigCoin_mp3);
    this.pushAudioCache(res.inGame_pick_coin_1_mp3);
    this.pushAudioCache(res.inGame_pick_coin_2_mp3);
    this.pushAudioCache(res.inGame_pick_coin_3_mp3);
    this.pushAudioCache(res.inGame_pick_coin_4_mp3);
    this.pushAudioCache(res.inGame_pick_coin_5_mp3);
    this.pushAudioCache(res.inGame_pick_coin_6_mp3);
    this.pushAudioCache(res.inGame_pick_coin_7_mp3);
    this.pushAudioCache(res.inGame_pick_coin_8_mp3);
    this.pushAudioCache(res.inGame_pick_heart_mp3);
    this.pushAudioCache(res.inGame_pick_pixie_mp3);
    this.pushAudioCache(res.outGame_efx_healthCharge_mp3);
    this.pushAudioCache(res.outGame_efx_senceChange_mp3);
    this.pushAudioCache(res.outGame_efx_showLogo_tutorial_mp3);
    this.pushAudioCache(res.outGame_menu_buyAvator_mp3);
    this.pushAudioCache(res.outGame_menu_changeAvator_mp3);
    this.pushAudioCache(res.outGame_menu_chooseLevel_mp3);
    this.pushAudioCache(res.outGame_menu_chooseSection_mp3);
    this.pushAudioCache(res.outGame_menu_closeStore_mp3);
    this.pushAudioCache(res.outGame_menu_intoStore_mp3);
    this.pushAudioCache(res.outGame_menu_leaveLocked_mp3);
    this.pushAudioCache(res.outGame_menu_leaveSection_mp3);
    this.pushAudioCache(res.outGame_menu_sectionLocked_mp3);
    this.pushAudioCache(res.outGame_menu_unlockSection_mp3);
    this.pushAudioCache(res.outGame_menu_viewSection_mp3);
    this.pushAudioCache(res.sfx_menu_buttonclick_mp3);
    this.pushAudioCache(res.sfx_menu_closewindow_mp3);
    this.pushAudioCache(res.sfx_menu_openwindow_mp3);
    this._audioAllCacheNum = this._audioCachePool.length;
  },
  preloadAudio: function () {
    this.preload(res._inGame_function_win_mp3);
    this.preload(res.efx_dog_bark_mp3);
    this.preload(res.inGame_action_bomb_mp3);
    this.preload(res.inGame_action_bullet_mp3);
    this.preload(res.inGame_action_jump_mp3);
    this.preload(res.inGame_action_smash_mp3);
    this.preload(res.inGame_action_smashOver_mp3);
    this.preload(res.inGame_action_smashStart__mp3);
    this.preload(res.inGame_action_teleport_mp3);
    this.preload(res.inGame_character_bearFear_1_mp3);
    this.preload(res.inGame_character_bearFear_2_mp3);
    this.preload(res.inGame_character_cop_1_mp3);
    this.preload(res.inGame_character_cop_2_mp3);
    this.preload(res.inGame_character_flashEyes_1_mp3);
    this.preload(res.inGame_character_flashEyes_2_mp3);
    this.preload(res.inGame_character_flashEyes_3_mp3);
    this.preload(res.inGame_character_hermione_1_mp3);
    this.preload(res.inGame_character_hermione_2_mp3);
    this.preload(res.inGame_character_kevo_1_mp3);
    this.preload(res.inGame_character_kevo_2_mp3);
    this.preload(res.inGame_character_littleDown_mp3);
    this.preload(res.inGame_character_littleDrop_mp3);
    this.preload(res.inGame_character_littleEscape_mp3);
    this.preload(res.inGame_character_littleShock_mp3);
    this.preload(res.inGame_character_littleWalk_mp3);
    this.preload(res.inGame_character_m_42_1_mp3);
    this.preload(res.inGame_character_m_42_2_mp3);
    this.preload(res.inGame_character_phantom_1_mp3);
    this.preload(res.inGame_character_phantom_2_mp3);
    this.preload(res.inGame_character_spaceman_1_mp3);
    this.preload(res.inGame_character_spaceman_2_mp3);
    this.preload(res.inGame_character_tiny_1_mp3);
    this.preload(res.inGame_character_tiny_2_mp3);
    this.preload(res.inGame_character_vampire_1_mp3);
    this.preload(res.inGame_character_vampire_2_mp3);
    this.preload(res.inGame_efx_blockBomb_multi_mp3);
    this.preload(res.inGame_efx_blockBomb_single_mp3);
    this.preload(res.inGame_efx_blockBreak_mp3);
    this.preload(res.inGame_efx_blockBreak_1_mp3);
    this.preload(res.inGame_efx_blockBreak_2_mp3);
    this.preload(res.inGame_efx_blockBreak_3_mp3);
    this.preload(res.inGame_efx_blockBreak_4_mp3);
    this.preload(res.inGame_efx_blockUnmove_mp3);
    this.preload(res.inGame_efx_bombCount_mp3);
    this.preload(res.inGame_efx_bombExplode_mp3);
    this.preload(res.inGame_efx_bubbleVanish_mp3);
    this.preload(res.inGame_efx_coinGenerate_mp3);
    this.preload(res.inGame_efx_coinListGenerate_mp3);
    this.preload(res.inGame_efx_entrance_mp3);
    this.preload(res.inGame_efx_exit_mp3);
    this.preload(res.inGame_efx_fire_mp3);
    this.preload(res.inGame_efx_hideLight_mp3);
    this.preload(res.inGame_efx_invisibleStart_mp3);
    this.preload(res.inGame_efx_showCourseText_mp3);
    this.preload(res.inGame_efx_showLight_mp3);
    this.preload(res.inGame_efx_showText_mp3);
    this.preload(res.inGame_efx_spring_mp3);
    this.preload(res.inGame_event_applause_mp3);
    this.preload(res.inGame_event_blockMove_mp3);
    this.preload(res.inGame_event_contact_mp3);
    this.preload(res.inGame_event_countDown_mp3);
    this.preload(res.inGame_event_deathInstant_mp3);
    this.preload(res.inGame_event_deathMonster_mp3);
    this.preload(res.inGame_event_deathMonster_1_mp3);
    this.preload(res.inGame_event_deathMonster_2_mp3);
    this.preload(res.inGame_event_deathMonster_3_mp3);
    this.preload(res.inGame_event_deathMonster_4_mp3);
    this.preload(res.inGame_event_deathMonster_5_mp3);
    this.preload(res.inGame_event_deathMonster_6_mp3);
    this.preload(res.inGame_event_deathNoLife_mp3);
    this.preload(res.inGame_event_fulfillLife_mp3);
    this.preload(res.inGame_event_hitBlock_mp3);
    this.preload(res.inGame_event_hitEnemy_mp3);
    this.preload(res.inGame_event_hurted_mp3);
    this.preload(res.inGame_event_machineAppear_mp3);
    this.preload(res.inGame_event_maskOff_mp3);
    this.preload(res.inGame_event_relayReach_mp3);
    this.preload(res.inGame_event_switchOff_mp3);
    this.preload(res.inGame_event_switchOn_mp3);
    this.preload(res.inGame_event_toGround_mp3);
    this.preload(res.inGame_function_allCoinsGotten_mp3);
    this.preload(res.inGame_function_bonusEntrance_mp3);
    this.preload(res.inGame_function_countCoins_mp3);
    this.preload(res.inGame_function_lose_mp3);
    this.preload(res.inGame_function_star_mp3);
    this.preload(res.inGame_function_unlockAvator_mp3);
    this.preload(res.inGame_function_win_mp3);
    this.preload(res.inGame_function_winStar1_mp3);
    this.preload(res.inGame_function_winStar2_mp3);
    this.preload(res.inGame_function_winStar3_mp3);
    this.preload(res.inGame_menu_click_mp3);
    this.preload(res.inGame_menu_hidePausePage_mp3);
    this.preload(res.inGame_menu_showMessage_mp3);
    this.preload(res.inGame_menu_showPausePage_mp3);
    this.preload(res.inGame_monster_crazyFound_mp3);
    this.preload(res.inGame_monster_crazyRush_mp3);
    this.preload(res.inGame_monster_enterCannon_mp3);
    this.preload(res.inGame_monster_jumpSlimeDown_mp3);
    this.preload(res.inGame_monster_launchCannon_mp3);
    this.preload(res.inGame_monster_rotateCannon_mp3);
    this.preload(res.inGame_monster_spikeExtend_mp3);
    this.preload(res.inGame_monster_spikeRevoke_mp3);
    this.preload(res.inGame_pick_bigCoin_mp3);
    this.preload(res.inGame_pick_coin_1_mp3);
    this.preload(res.inGame_pick_coin_2_mp3);
    this.preload(res.inGame_pick_coin_3_mp3);
    this.preload(res.inGame_pick_coin_4_mp3);
    this.preload(res.inGame_pick_coin_5_mp3);
    this.preload(res.inGame_pick_coin_6_mp3);
    this.preload(res.inGame_pick_coin_7_mp3);
    this.preload(res.inGame_pick_coin_8_mp3);
    this.preload(res.inGame_pick_heart_mp3);
    this.preload(res.inGame_pick_pixie_mp3);
    this.preload(res.outGame_efx_healthCharge_mp3);
    this.preload(res.outGame_efx_senceChange_mp3);
    this.preload(res.outGame_efx_showLogo_mp3);
    this.preload(res.outGame_efx_showLogo_tutorial_mp3);
    this.preload(res.outGame_menu_buyAvator_mp3);
    this.preload(res.outGame_menu_changeAvator_mp3);
    this.preload(res.outGame_menu_chooseLevel_mp3);
    this.preload(res.outGame_menu_chooseSection_mp3);
    this.preload(res.outGame_menu_closeStore_mp3);
    this.preload(res.outGame_menu_intoStore_mp3);
    this.preload(res.outGame_menu_leaveLocked_mp3);
    this.preload(res.outGame_menu_leaveSection_mp3);
    this.preload(res.outGame_menu_sectionLocked_mp3);
    this.preload(res.outGame_menu_unlockSection_mp3);
    this.preload(res.outGame_menu_viewSection_mp3);
    this.preload(res.sfx_menu_buttonclick_mp3);
    this.preload(res.sfx_menu_closewindow_mp3);
    this.preload(res.sfx_menu_openwindow_mp3);
  }
};
vee.soundPopup = function () {
    vee.Audio.onEvent("popLayer");
  };
vee.soundCloseLayer = function () {
    vee.Audio.onEvent("closeLayer");
  };
vee.soundButton = function () {
    vee.Audio.onEvent("button");
  };
