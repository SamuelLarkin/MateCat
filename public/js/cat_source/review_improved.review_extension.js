if ( ReviewImproved.enabled() && config.isReview ) {
(function($, root, undefined) {

    var originalBindShortcuts = UI.bindShortcuts;

    UI.shortcuts = UI.shortcuts || {} ;

    $.extend(UI.shortcuts, {
        "reject": {
            "label" : "Reject translation",
            "equivalent": "click on Rejected",
            "keystrokes" : {
                "standard": "ctrl+shift+down",
                "mac": "meta+shift+down"
            }
        }
    });

    $.extend(UI, {
        /**
         * Search for the next translated segment to propose for revision.
         * This function searches in the current UI first, then falls back
         * to invoke the server and eventually reload the page to the new
         * URL.
         */
        openNextTranslated: function (sid) {
            sid = sid || UI.currentSegmentId;
            var el = $('#segment-' + sid);

            var translatedList = [];
            var approvedList = [];

            var clickableSelector = UI.targetContainerSelector();

            if ( el.nextAll('.status-translated, .status-approved').length ) {

                translatedList = el.nextAll('.status-translated');
                approvedList   = el.nextAll('.status-approved');

                if ( translatedList.length ) {
                    translatedList.first().find( clickableSelector ).click();
                } else {
                    approvedList.first().find( clickableSelector ).click();

                }

            } else {

                file = el.parents('article');
                file.nextAll(':has(section.status-translated), :has(section.status-approved)').each(function () {

                    var translatedList = $(this).find('.status-translated');
                    var approvedList   = $(this).find('.status-approved');

                    if( translatedList.length ) {
                        translatedList.first().find( clickableSelector ).click();
                    } else {
                        UI.reloadWarning();
                    }

                    return false;

                });
                // else
                if($('section.status-translated, section.status-approved').length) { // find from the beginning of the currently loaded segments

                    translatedList = $('section.status-translated');
                    approvedList   = $('section.status-approved');

                    if( translatedList.length ) {
                        if((translatedList.first().is(UI.currentSegment))) {
                            UI.scrollSegment(translatedList.first());
                        } else {
                            translatedList.first().find( clickableSelector ).click();
                        }
                    } else {
                        if((approvedList.first().is(UI.currentSegment))) {
                            UI.scrollSegment(approvedList.first());
                        } else {
                            approvedList.first().find( clickableSelector ).click();
                        }
                    }

                } else { // find in not loaded segments

                    APP.doRequest({
                        data: {
                            action: 'getNextReviseSegment',
                            id_job: config.job_id,
                            password: config.password,
                            id_segment: sid
                        },
                        error: function() {
                        },
                        success: function(d) {
                            if( d.nextId == null ) return false;
                            UI.render({
                                firstLoad: false,
                                segmentToOpen: d.nextId
                            });
                        }
                    });

                }
            }
        },
        /**
         * translationIsToSave
         *
         * only check if translation is queued
         */
        translationIsToSave : function( segment ) {
            var alreadySet = UI.alreadyInSetTranslationTail( segment.id );
            return !alreadySet ;
        },
        deleteTranslationIssue : function( context ) {
            console.debug('delete issue', context);

            var parsed = JSON.parse( context );
            var issue_path = sprintf(
                '/api/v2/jobs/%s/%s/segments/%s/translation-issues/%s',
                config.id_job, config.password,
                parsed.id_segment,
                parsed.id_issue
            );

            $.ajax({
                url: issue_path,
                type: 'DELETE'
            }).done( function( data ) {
                var record = MateCat.db.segment_translation_issues
                    .by('id', parsed.id_issue);
                MateCat.db.segment_translation_issues.remove( record );
                root.ReviewImproved.reloadQualityReport();
            });
        },
        createButtons: function(segment) {
            root.ReviewImproved.renderButtons();
            UI.currentSegment.trigger('buttonsCreation');

        },
        copySuggestionInEditarea : function() {
            return ;
        },
        targetContainerSelector : function() {
            return '.errorTaggingArea';
        },

        getSegmentTarget : function() {
            // read status from DOM? wrong approach, read from
            // database instead
            var segment = db.segments.by('sid', sid);
            var translation =  segment.translation ;

            return translation ;
        },
        getSegmentMarkup : function() {
            var segmentData = arguments[0];
            var data = UI.getSegmentTemplateData.apply( this, arguments ) ;

            var section            = $( UI.getSegmentTemplate()( data ) );
            var segment_body       = $( MateCat.Templates[ 'review_improved/segment_body' ](data) );
            var textarea_container = MateCat.Templates[ 'review_improved/text_area_container' ](
                {
                    decoded_translation : data.decoded_translation
                });

            segment_body
                .find('[data-mount="segment_text_area_container"]')
                .html( textarea_container );

            section
                .find('[data-mount="segment_body"]')
                .html( segment_body );

            return section[0].outerHTML ;
        },

        getSegmentTemplate : function() {
            return MateCat.Templates['review_improved/segment'];
        },

        rejectAndGoToNext : function() {
            UI.setTranslation({
                id_segment: UI.currentSegmentId,
                status: 'rejected',
                caller: false,
                byStatus: false,
                propagate: false,
            });

            UI.gotoNextSegment() ;
        },

        bindShortcuts : function() {

            originalBindShortcuts();

            $('body').on('keydown.shortcuts', null, UI.shortcuts.reject.keystrokes.standard, function(e) {
                e.preventDefault();
                UI.rejectAndGoToNext();
            });

            $('body').on('keydown.shortcuts', null, UI.shortcuts.reject.keystrokes.mac, function(e) {
                e.preventDefault();
                UI.rejectAndGoToNext();
            });
        }
    });



  })(jQuery, window, ReviewImproved) ;
}
