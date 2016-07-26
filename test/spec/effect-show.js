/* eslint-env jasmine */
/* global loadPage:false, customMatchers:false */
/* eslint no-underscore-dangle: [2, {"allow": ["_id"]}] */

describe('effect-show', function() {
  'use strict';

  var window, document, traceLog, pageDone, ll, titles = [];

  function registerTitle(title) {
    titles.push(title);
    return title;
  }

  function loadBefore(beforeDone) {
    jasmine.addMatchers(customMatchers);
    loadPage('spec/common/page.html', function(frmWindow, frmDocument, body, done) {
      window = frmWindow;
      document = frmDocument;
      traceLog = window.traceLog;
      traceLog.enabled = true;
      pageDone = done;
      ll = new window.LeaderLine(document.getElementById('elm1'), document.getElementById('elm3'));
      beforeDone();
    }, 'effect-show - ' + titles.shift());
  }

  describe('show()', function() {

    beforeEach(loadBefore);

    it(registerTitle('check args'), function() {
      var props = window.insProps[ll._id];

      // default
      traceLog.clear();
      ll.hide();
      expect(traceLog.getTaggedLog('show')).toEqual([
        'update.show_on', 'update.show_effect', 'update.show_animOptions'
      ]);
      expect(props.curStats.show_on).toBe(false);
      expect(props.curStats.show_effect).toBe('fade');
      expect(props.curStats.show_animOptions).toEqual(window.SHOW_EFFECTS.fade.defaultAnimOptions);

      // change
      traceLog.clear();
      ll.hide('draw');
      expect(traceLog.getTaggedLog('show')).toEqual([
        'update.show_effect', 'update.show_animOptions'
      ]);
      expect(props.curStats.show_on).toBe(false);
      expect(props.curStats.show_effect).toBe('draw');
      expect(props.curStats.show_animOptions).toEqual(window.SHOW_EFFECTS.draw.defaultAnimOptions);

      // inheritance
      traceLog.clear();
      ll.hide();
      expect(traceLog.getTaggedLog('show')).toEqual([]);
      expect(props.curStats.show_on).toBe(false);
      expect(props.curStats.show_effect).toBe('draw');
      expect(props.curStats.show_animOptions).toEqual(window.SHOW_EFFECTS.draw.defaultAnimOptions);

      // invalid -> inheritance
      traceLog.clear();
      ll.hide('draw2');
      expect(traceLog.getTaggedLog('show')).toEqual([]);
      expect(props.curStats.show_on).toBe(false);
      expect(props.curStats.show_effect).toBe('draw');
      expect(props.curStats.show_animOptions).toEqual(window.SHOW_EFFECTS.draw.defaultAnimOptions);

      // change animOptions
      traceLog.clear();
      ll.hide('draw', {duration: 1000});
      expect(traceLog.getTaggedLog('show')).toEqual(['update.show_animOptions']);
      expect(props.curStats.show_on).toBe(false);
      expect(props.curStats.show_effect).toBe('draw');
      expect(props.curStats.show_animOptions).toEqual({duration: 1000, timing: [0.58, 0, 0.42, 1]}); // optimized

      pageDone();
    });

    it(registerTitle('flow - CHANGE: options:NO, show_on:NO, show_inAnim:NO'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('fade', {duration: 1});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(false); // check

        traceLog.clear();
        ll.hide();
        expect(traceLog.log).toEqual([
          '<show>', '</show>' // do nothing
        ]);

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('flow - CHANGE: options:NO, show_on:NO, show_inAnim:YES'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('fade', {duration: 1000});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(true); // check

        traceLog.clear();
        ll.hide();
        expect(traceLog.log).toEqual([
          '<show>', '</show>' // do nothing
        ]);

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('flow - CHANGE: options:NO, show_on:YES, show_inAnim:NO'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('fade', {duration: 1});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(false); // check

        traceLog.clear();
        ll.show();
        expect(traceLog.log).toEqual([
          '<SHOW_EFFECTS.fade.start>', 'timeRatio=NONE', '</SHOW_EFFECTS.fade.start>', // restart
          '<show>', 'update.show_on', '</show>'
        ]);

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('flow - CHANGE: options:NO, show_on:YES, show_inAnim:YES'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('fade', {duration: 1000});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(true); // check

        traceLog.clear();
        ll.show();
        expect(traceLog.log).toEqual([
          '<SHOW_EFFECTS.fade.start>', 'timeRatio=prevTimeRatio', '</SHOW_EFFECTS.fade.start>', // restart
          '<show>', 'update.show_on', '</show>'
        ]);

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('flow - CHANGE: options:YES, show_on:NO, show_inAnim:NO'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('fade', {duration: 1});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(false); // check

        traceLog.clear();
        ll.hide('fade', {duration: 500});
        expect(traceLog.log).toEqual([
          '<show>', 'update.show_animOptions', '</show>' // do nothing
        ]);

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('flow - CHANGE: options:YES, show_on:NO, show_inAnim:YES'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('fade', {duration: 1000});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(true); // check

        traceLog.clear();
        ll.hide('fade', {duration: 500});
        expect(traceLog.log).toEqual([
          // reset with timeRatio
          '<SHOW_EFFECTS.fade.stop>', 'finish=undefined', 'on=aplStats.show_on=false', '</SHOW_EFFECTS.fade.stop>',
          '<SHOW_EFFECTS.fade.init>',
          '<SHOW_EFFECTS.fade.start>', 'timeRatio=timeRatio', '</SHOW_EFFECTS.fade.start>',
          '</SHOW_EFFECTS.fade.init>',
          '<show>', 'update.show_animOptions', '</show>'
        ]);

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('flow - CHANGE: options(effectName):YES, show_on:NO, show_inAnim:YES'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('draw', {duration: 1000});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(true); // check

        traceLog.clear();
        ll.hide('fade');
        expect(traceLog.log).toEqual([
          // remove and init with timeRatio
          '<SHOW_EFFECTS.draw.stop>', 'finish=true', 'on=on=true',
          // ==== update()
          '<updatePath>', 'setPathData', '</updatePath>',
          '<updateViewBox>', 'width', 'height', '</updateViewBox>',
          '<updateMask>', 'not-updated', '</updateMask>',
          '<update>', 'updated.path', 'updated.viewBox', '</update>',
          // ==== /update()
          '</SHOW_EFFECTS.draw.stop>',
          '<SHOW_EFFECTS.fade.init>',
          '<SHOW_EFFECTS.fade.start>', 'timeRatio=timeRatio', '</SHOW_EFFECTS.fade.start>',
          '</SHOW_EFFECTS.fade.init>',
          '<show>', 'update.show_effect', 'update.show_animOptions', '</show>'
        ]);

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('flow - CHANGE: options:YES, show_on:YES, show_inAnim:NO'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('fade', {duration: 1});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(false); // check

        traceLog.clear();
        ll.show('fade', {duration: 500});
        expect(traceLog.log).toEqual([
          // reset
          '<SHOW_EFFECTS.fade.init>',
          '<SHOW_EFFECTS.fade.start>', 'timeRatio=NONE', '</SHOW_EFFECTS.fade.start>',
          '</SHOW_EFFECTS.fade.init>',
          '<show>', 'update.show_on', 'update.show_animOptions', '</show>'
        ]);

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('flow - CHANGE: options(effectName):YES, show_on:YES, show_inAnim:NO'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('draw', {duration: 1});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(false); // check

        traceLog.clear();
        ll.show('fade');
        expect(traceLog.log).toEqual([
          // remove and init
          '<SHOW_EFFECTS.draw.stop>', 'finish=true', 'on=on=true',
          // ==== update()
          '<updatePath>', 'setPathData', '</updatePath>',
          '<updateViewBox>', 'width', 'height', '</updateViewBox>',
          '<updateMask>', 'not-updated', '</updateMask>',
          '<update>', 'updated.path', 'updated.viewBox', '</update>',
          // ==== /update()
          '</SHOW_EFFECTS.draw.stop>',
          '<SHOW_EFFECTS.fade.init>',
          '<SHOW_EFFECTS.fade.start>', 'timeRatio=NONE', '</SHOW_EFFECTS.fade.start>',
          '</SHOW_EFFECTS.fade.init>',
          '<show>', 'update.show_on', 'update.show_effect', 'update.show_animOptions', '</show>'
        ]);

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('flow - CHANGE: options:YES, show_on:YES, show_inAnim:YES'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('fade', {duration: 1000});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(true); // check

        traceLog.clear();
        ll.show('fade', {duration: 500});
        expect(traceLog.log).toEqual([
          // reset with timeRatio
          '<SHOW_EFFECTS.fade.stop>', 'finish=undefined', 'on=aplStats.show_on=false', '</SHOW_EFFECTS.fade.stop>',
          '<SHOW_EFFECTS.fade.init>',
          '<SHOW_EFFECTS.fade.start>', 'timeRatio=timeRatio', '</SHOW_EFFECTS.fade.start>',
          '</SHOW_EFFECTS.fade.init>',
          '<show>', 'update.show_on', 'update.show_animOptions', '</show>'
        ]);

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('flow - CHANGE: options(effectName):YES, show_on:YES, show_inAnim:YES'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('draw', {duration: 1000});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(true); // check

        traceLog.clear();
        ll.show('fade');
        expect(traceLog.log).toEqual([
          // remove and init with timeRatio
          '<SHOW_EFFECTS.draw.stop>', 'finish=true', 'on=on=true',
          // ==== update()
          '<updatePath>', 'setPathData', '</updatePath>',
          '<updateViewBox>', 'width', 'height', '</updateViewBox>',
          '<updateMask>', 'not-updated', '</updateMask>',
          '<update>', 'updated.path', 'updated.viewBox', '</update>',
          // ==== /update()
          '</SHOW_EFFECTS.draw.stop>',
          '<SHOW_EFFECTS.fade.init>',
          '<SHOW_EFFECTS.fade.start>', 'timeRatio=timeRatio', '</SHOW_EFFECTS.fade.start>',
          '</SHOW_EFFECTS.fade.init>',
          '<show>', 'update.show_on', 'update.show_effect', 'update.show_animOptions', '</show>'
        ]);

        pageDone();
        done();
      }, 10);
    });

  });

  describe('in bindWindow()', function() {

    beforeEach(loadBefore);

    it(registerTitle('show_inAnim:NO'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('fade', {duration: 1});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(false); // check

        traceLog.clear();
        ll.setOptions({
          start: document.getElementById('iframe1').contentDocument.getElementById('elm1'),
          end: document.getElementById('iframe1').contentDocument.getElementById('elm2')
        });
        expect(traceLog.log).not.toContain('<SHOW_EFFECTS.fade.stop>');
        expect(props.isShown).toBe(false);
        expect(props.svg.style.visibility).toBe('hidden');

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('show_inAnim:YES'), function(done) {
      var props = window.insProps[ll._id];

      ll.hide('fade', {duration: 1000});
      setTimeout(function() {
        expect(props.curStats.show_inAnim).toBe(true); // check

        traceLog.clear();
        ll.setOptions({
          start: document.getElementById('iframe1').contentDocument.getElementById('elm1'),
          end: document.getElementById('iframe1').contentDocument.getElementById('elm2')
        });
        expect(traceLog.getTaggedLog('SHOW_EFFECTS.fade.stop')).toEqual([
          'finish=true', 'on=aplStats.show_on=false'
        ]);
        expect(props.isShown).toBe(false);
        expect(props.svg.style.visibility).toBe('hidden');

        pageDone();
        done();
      }, 10);
    });

  });

  describe('SHOW_EFFECTS', function() {

    describe('none', function() {

      beforeEach(loadBefore);

      it(registerTitle('init() removes anim'), function(done) {
        var props = window.insProps[ll._id];

        ll.hide('draw');
        expect(window.animTasks.length).toBe(1);
        setTimeout(function() {
          expect(props.curStats.show_inAnim).toBe(true); // check
          expect(window.animTasks.length).toBe(1);

          traceLog.clear();
          ll.hide('none');
          expect(traceLog.log).toContain('<SHOW_EFFECTS.none.init>');
          expect(window.animTasks.length).toBe(0);
          expect(props.curStats.show_animId == null).toBe(true); // eslint-disable-line eqeqeq

          pageDone();
          done();
        }, 10);
      });

      it(registerTitle('start() and stop() initialize view'), function() {
        var props;

        ll.remove();
        ll = new window.LeaderLine(document.getElementById('elm1'), document.getElementById('elm3'),
          {hide: true});
        props = window.insProps[ll._id];
        expect(props.isShown).toBe(false);
        expect(props.svg.style.visibility).toBe('hidden');

        // start() shows view (SHOW_EFFECTS.none.start uses stop())
        traceLog.clear();
        ll.show('none');
        expect(traceLog.log).toContain('<SHOW_EFFECTS.none.start>');
        expect(props.isShown).toBe(true);
        expect(props.svg.style.visibility).toBe('');

        ll.remove();
        ll = new window.LeaderLine(document.getElementById('elm1'), document.getElementById('elm3'),
          {hide: true});
        props = window.insProps[ll._id];
        expect(props.isShown).toBe(false);
        expect(props.svg.style.visibility).toBe('hidden');

        // stop() shows view
        traceLog.clear();
        window.SHOW_EFFECTS.none.stop(props, true, true);
        expect(traceLog.getTaggedLog('SHOW_EFFECTS.none.stop')).toEqual([
          'finish=true', 'on=on=true'
        ]);
        expect(props.isShown).toBe(true);
        expect(props.svg.style.visibility).toBe('');

        // stop() hides view
        traceLog.clear();
        window.SHOW_EFFECTS.none.stop(props, true, false);
        expect(traceLog.getTaggedLog('SHOW_EFFECTS.none.stop')).toEqual([
          'finish=true', 'on=on=false'
        ]);
        expect(props.isShown).toBe(false);
        expect(props.svg.style.visibility).toBe('hidden');

        pageDone();
      });

    });

    describe('fade', function() {

      beforeEach(loadBefore);

      it(registerTitle('init() removes anim'), function(done) {
        var props = window.insProps[ll._id], value;

        ll.hide('draw');
        expect(window.animTasks.length).toBe(1);
        setTimeout(function() {
          expect(props.curStats.show_inAnim).toBe(true); // check
          expect(window.animTasks.length).toBe(1);

          traceLog.clear();
          value = props.curStats.show_animId;
          ll.hide('fade');
          expect(traceLog.log).toContain('<SHOW_EFFECTS.fade.init>');
          expect(window.animTasks.length).toBe(1);
          expect(props.curStats.show_animId).not.toBe(value);

          pageDone();
          done();
        }, 10);
      });

      it(registerTitle('start() and stop() initialize view'), function() {
        var props;

        ll.remove();
        ll = new window.LeaderLine(document.getElementById('elm1'), document.getElementById('elm3'),
          {hide: true});
        props = window.insProps[ll._id];
        expect(props.isShown).toBe(false);
        expect(props.svg.style.visibility).toBe('hidden');

        // start() shows view
        traceLog.clear();
        ll.show('fade');
        expect(traceLog.log).toContain('<SHOW_EFFECTS.fade.start>');
        expect(props.isShown).toBe(true);
        expect(props.svg.style.visibility).toBe('');

        ll.remove();
        ll = new window.LeaderLine(document.getElementById('elm1'), document.getElementById('elm3'),
          {hide: true});
        props = window.insProps[ll._id];
        expect(props.isShown).toBe(false);
        expect(props.svg.style.visibility).toBe('hidden');

        // stop() shows view
        traceLog.clear();
        window.SHOW_EFFECTS.fade.stop(props, true, true);
        expect(traceLog.getTaggedLog('SHOW_EFFECTS.fade.stop')).toEqual([
          'finish=true', 'on=on=true'
        ]);
        expect(props.isShown).toBe(true);
        expect(props.svg.style.opacity).toBe('1');
        expect(props.svg.style.visibility).toBe('');

        // stop() hides view
        traceLog.clear();
        window.SHOW_EFFECTS.fade.stop(props, true, false);
        expect(traceLog.getTaggedLog('SHOW_EFFECTS.fade.stop')).toEqual([
          'finish=true', 'on=on=false'
        ]);
        expect(props.isShown).toBe(false);
        expect(props.svg.style.opacity).toBe('0');
        expect(props.svg.style.visibility).toBe('hidden');

        pageDone();
      });

    });

    describe('draw', function() {

      beforeEach(loadBefore);

      it(registerTitle('init() removes anim'), function(done) {
        var props = window.insProps[ll._id], value;

        ll.hide('fade');
        expect(window.animTasks.length).toBe(1);
        setTimeout(function() {
          expect(props.curStats.show_inAnim).toBe(true); // check
          expect(window.animTasks.length).toBe(1);

          traceLog.clear();
          value = props.curStats.show_animId;
          ll.hide('draw');
          expect(traceLog.log).toContain('<SHOW_EFFECTS.draw.init>');
          expect(window.animTasks.length).toBe(1);
          expect(props.curStats.show_animId).not.toBe(value);

          pageDone();
          done();
        }, 10);
      });

      it(registerTitle('start() and stop() initialize view'), function() {
        var props;

        ll.remove();
        ll = new window.LeaderLine(document.getElementById('elm1'), document.getElementById('elm3'),
          {hide: true});
        props = window.insProps[ll._id];
        expect(props.isShown).toBe(false);
        expect(props.svg.style.visibility).toBe('hidden');

        // start() shows view
        traceLog.clear();
        ll.show('draw');
        expect(traceLog.log).toContain('<SHOW_EFFECTS.draw.start>');
        expect(props.isShown).toBe(true);
        expect(props.svg.style.visibility).toBe('');

        ll.remove();
        ll = new window.LeaderLine(document.getElementById('elm1'), document.getElementById('elm3'),
          {hide: true});
        props = window.insProps[ll._id];
        expect(props.isShown).toBe(false);
        expect(props.svg.style.visibility).toBe('hidden');

        // stop() shows view
        traceLog.clear();
        window.SHOW_EFFECTS.draw.stop(props, true, true);
        expect(traceLog.getTaggedLog('SHOW_EFFECTS.draw.stop')).toEqual([
          'finish=true', 'on=on=true'
        ]);
        expect(props.isShown).toBe(true);
        expect(props.pathList.animVal == null).toBe(true); // eslint-disable-line eqeqeq
        expect(props.svg.style.visibility).toBe('');

        // stop() hides view
        traceLog.clear();
        window.SHOW_EFFECTS.draw.stop(props, true, false);
        expect(traceLog.getTaggedLog('SHOW_EFFECTS.draw.stop')).toEqual([
          'finish=true', 'on=on=false'
        ]);
        expect(props.isShown).toBe(false);
        expect(props.pathList.animVal).toEqual(
          [[props.pathList.baseVal[0][0], props.pathList.baseVal[0][0]]]);
        expect(props.svg.style.visibility).toBe('hidden');

        pageDone();
      });

    });

  });

});
