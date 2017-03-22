/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

define([
  'okta',
  'q',
  'util/FormController',
  'util/FormType'
],
function (Okta, Q, FormController, FormType) {

  var _ = Okta._;
  var $ = Okta.$;

  var BarcodeView = Okta.View.extend({
    className: 'clearfix',
    template: '\
      <div class="">\
          <div class="qrcode-wrap">\
              <div data-se="qrcode-success" class="qrcode-success"></div>\
              <!-- <img data-se="qrcode" class="qrcode-image" src="/user/settings/factors/soft_token/qr?t={{now}}" --> \
              <img data-se="qrcode" class="qrcode-image" src="{{qrcode}}"> \
          </div>\
      </div>\
    ',

    events: {
      'click [data-type="refresh-qrcode"]': function (e) {
        e.preventDefault();
        // TODO
      }
    },

    getTemplateData: function () {
      var data = {now: new Date().getTime()};
      var url = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';
      data.qrcode = url;

      return data;
    }
  });

  return FormController.extend({
    className: 'barcode-totp',
    Model: function () {
      return {
        url: '/signin/qr-login/verify',
        local: {
          qrcode: 'string'
        }
      };
    },

    Form: {
      title: 'Okta QR Login',
      noCancelButton: true,
      className: 'barcode-scan',

      formChildren: [
        FormType.View({View: BarcodeView})
      ]
    },

    initialize: function () {
      
    },

    XfetchInitialData: function () {
      // var deferred = Q.defer();
      // var self = this;
      
      // $.ajax({ url: 'user/settings/factors/soft_token/qr',
      //          cache: false 
      //        })
      // .always(function () {
      //   self.model.set('qrcode', url);
      //   deferred.resolve();
      // });

      // return deferred.promise;
    },

    postRender: function () {
      this.$('.o-form-button-bar').addClass('hide');
      
      this.poll();
    },

    poll: function () {
      var self = this;
      
      Q.delay(2000)
      .then(function () {
        self.form.clearErrors();
      })
      .then(function () {
        return self.model.fetch();
      })
      .then(function () {
        /*
        IF succeed THEN 
        1. append successful callout to the page
           slide away qr code and slide in successful icon
        2. start to redirect to home page
           delay 1 second
           this.options.appState.trigger('navigate', '/');
        ELSE recursively call this.poll
        */
        self.poll();
        
      })
      .fail(function () {
        self.poll();
      })
    }
  });

});
