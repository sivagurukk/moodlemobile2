// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular.module('mm.addons.mod_assign')

/**
 * Handler for comments feedback plugin.
 *
 * @module mm.addons.mod_assign
 * @ngdoc service
 * @name $mmaModAssignFeedbackCommentsHandler
 */
.factory('$mmaModAssignFeedbackCommentsHandler', function($mmText, $mmSite) {

    var self = {},
        drafts = {};

    /**
     * Whether or not the rule is enabled for the site.
     *
     * @return {Boolean}
     */
    self.isEnabled = function() {
        // We don't need to call getComments, so receiving the plugin as active means it's supported.
        return true;
    };

    /**
     * Whether or not the plugin is enabled for editing in the site.
     *
     * @return {Boolean}
     */
    self.isEnabledForEdit = function() {
        return true;
    };

    /**
     * Get the name of the directive to render this plugin.
     *
     * @return {String} Directive name.
     */
    self.getDirectiveName = function() {
        return 'mma-mod-assign-feedback-comments';
    };

    /**
     * Should prepare and add to pluginData the data to send to server based in the draft data saved.
     *
     * @param  {Number} assignId     Assignment ID.
     * @param  {Number} userId       User ID.
     * @param  {Object} pluginData   Object where to add the plugin data.
     * @param  {String} [siteId]     Site ID. If not defined, current site.
     * @return {Void}
     */
    self.prepareFeedbackData = function(assignId, userId, pluginData, siteId) {
        var draft = self.getDraft(assignId, userId, siteId);
        if (draft) {
            pluginData.assignfeedbackcomments_editor = draft;
        }
    };

    /**
     * Get feedback data in the input data to save as draft.
     *
     * @param  {Object}  plugin     Plugin to get the data for.
     * @param  {Object}  inputData  Data entered in the feedback form.
     * @return {Void}
     */
    self.getFeedbackDataToDraft = function(plugin, inputData) {
        return {
            text: getTextToSubmit(plugin, inputData),
            format: 1
        };
    };

    /**
     * Check if the feedback data has changed for this plugin.
     *
     * @param  {Object} assign     Assignment.
     * @param  {Object} plugin     Plugin.
     * @param  {Object} inputData  Data entered in the feedback form.
     * @return {Promise}           Promise resolved with true if data has changed, resolved with false otherwise.
     */
    self.hasDataChanged = function(assign, plugin, inputData) {
        // Check if text has changed.
        if (typeof plugin.originalText != 'undefined') {
            return plugin.originalText != inputData.assignfeedbackcomments_editor;
        } else {
            return false;
        }
    };

    /**
     * Get the text to submit.
     *
     * @param  {Object} plugin    Plugin.
     * @param  {Object} inputData Data entered in the feedback edit form.
     * @return {String}           Text to submit.
     */
    function getTextToSubmit(plugin, inputData) {
        var text = inputData.assignfeedbackcomments_editor,
            files = plugin.fileareas && plugin.fileareas[0] ? plugin.fileareas[0].files : [];

        return $mmText.restorePluginfileUrls(text, files);
    }

    /**
     * Load a feedback draft to be sent.
     *
     * @param  {Number} assignId     Assignment ID.
     * @param  {Number} userId       User ID.
     * @param  {String} [siteId]     Site ID. If not defined, current site.
     * @return {Object}              With the draft loaded.
     */
    self.getDraft = function(assignId, userId, siteId) {
        var id = getDraftId(assignId, userId, siteId);

        if (typeof drafts[id] != 'undefined') {
            return drafts[id];
        }
        return false;
    };

    /**
     * Discard a feedback draft previously saved.
     *
     * @param  {Number} assignId     Assignment ID.
     * @param  {Number} userId       User ID.
     * @param  {String} [siteId]     Site ID. If not defined, current site.
     */
    self.discardDraft = function(assignId, userId, siteId) {
        var id = getDraftId(assignId, userId, siteId);

        if (typeof drafts[id] != 'undefined') {
            delete drafts[id];
        }
    };

    /**
     * Save a feedback draft to be sent.
     *
     * @param  {Number} assignId     Assignment ID.
     * @param  {Number} userId       User ID.
     * @param  {Object} data         Data to save.
     * @param  {String} [siteId]     Site ID. If not defined, current site.
     */
    self.saveDraft = function(assignId, userId, data, siteId) {
        if (data) {
            var id = getDraftId(assignId, userId, siteId);

            drafts[id] = data;
        }
    };

    /**
     * Convenience function to create a draft id.
     *
     * @param  {Number} assignId     Assignment ID.
     * @param  {Number} userId       User ID.
     * @param  {String} [siteId]     Site ID. If not defined, current site.
     */
    function getDraftId(assignId, userId, siteId) {
        siteId = siteId || $mmSite.getId();

        return siteId + '#' + assignId + '#' + userId;
    }

    return self;
})

.run(function($mmAddonManager) {
    // Use addon manager to inject $mmaModAssignFeedbackDelegate. This is to provide an example for remote addons,
    // since they cannot assume that the assign addon will be packaged in custom apps.
    var $mmaModAssignFeedbackDelegate = $mmAddonManager.get('$mmaModAssignFeedbackDelegate');
    if ($mmaModAssignFeedbackDelegate) {
        $mmaModAssignFeedbackDelegate.registerHandler('mmaModAssignFeedbackComments', 'comments',
                '$mmaModAssignFeedbackCommentsHandler');
    }
});
