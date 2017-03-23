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
  'util/Enums',
  'util/FormController',
  'util/FormType',
  'shared/util/Util',
],
function (Okta, Q, Enums, FormController, FormType, Util) {

  var _ = Okta._;
  var $ = Okta.$;

  var Footer = Okta.View.extend({
    template: '\
      <a href="#" class="link help js-back" data-se="back-link">\
        {{i18n code="goback" bundle="login"}}\
      </a>\
    ',
    className: 'auth-footer',
    events: {
      'click .js-back' : function (e) {
        e.preventDefault();
        this.back();
      }
    },
    back: function () {
      this.state.set('navigateDir', Enums.DIRECTION_BACK);
      this.options.appState.trigger('navigate', '');
    }
  });

  var sessionCookieRedirectTpl = Okta.tpl(
    '{{baseUrl}}/login/sessionCookieRedirect?checkAccountSetupComplete=true' +
    '&token={{{token}}}&redirectUrl={{{redirectUrl}}}'
  );

  var BarcodeView = Okta.View.extend({
    className: 'clearfix',
    template: '\
      <div class="">\
          <style> .qrcode-success .success-16-green::before {font-size: 180px; }\
                  .qrcode-image { margin-left: -30px; }\
                  .qrcode-success { height: 200px; padding-left: 70px; margin: -20px 0 20px;} \
                  .qrcode-wrap { position: relative; }\
                  .qrcode-logo { width: 64px; height: 64px; border-radius: 32px; position: absolute; top: 130px; left: 100px;}\
          </style>\
          <div class="qrcode-wrap">\
              <div style="" data-se="qrcode-success" class="qrcode-success hide">\
                <span class="icon icon-16 icon-only success-16-green"></span>\
              </div>\
              <div class="qrcode-image-wrap">\
                <img class="qrcode-logo" src="/assets/img/logos/okta-logo-2.png" /> \
                <img data-se="qrcode" class="qrcode-image" src="/api/v1/sso/qr/generate?t={{qrtoken}}" /> \
              </div>\
          </div>\
      </div>\
    ',

    events: {
      
    },

    getTemplateData: function () {
      var data = {qrtoken: this.model.get('id')};
      var url = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';
      data.qrcode = url;

      return data;
    }
  });

  return FormController.extend({
    className: 'barcode-totp',
    Model: function () {
      return {
        url: function () {
          return '/api/v1/sso/qr/verify/' +  this.get('id');
        },
        props: {
          id: 'string'
        }
      };
    },

    Form: {
      subtitle: 'Scan the following from your Okta Mobile App',
      noCancelButton: true,
      className: 'barcode-scan',

      formChildren: [
        FormType.View({View: BarcodeView})
      ],

      render: function () {
        Okta.Form.prototype.render.apply(this, arguments);
        this.$('.o-form-button-bar').remove();
      }
    },

    Footer: Footer,

    initialize: function () {
      this.model.set('id', (new Date()).getTime());
    },

    postRender: function () {      
      this.poll();
    },

    poll: function () {
      var self = this;

      Q.delay(1500)
      .then(function () {
        self.form.clearErrors();
      })
      .then(function () {
        return $.get(self.model.url());
      })
      .then(function (res) {
        if (res.status === 'SUCCESS') {
          self.$('.qrcode-image-wrap').hide("slow", function () {
            self.$('.qrcode-success').show("slow");
          });
          Util.redirect(sessionCookieRedirectTpl({
            baseUrl: self.settings.get('baseUrl'),
            token: encodeURIComponent(res.sessionToken),
            redirectUrl: encodeURIComponent(self.settings.get('redirectUrl') || 'http://haisheng.okta1.com:1802')
          }));
        } else {
          self.poll();
        }
      })
      .fail(function () {
      })
    }
  });

});
