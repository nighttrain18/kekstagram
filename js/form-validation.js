'use strict';

(function () {
    var INVALID_INPUT_CLASSNAME = 'invalid-input';
    var QUANTITY_HASHTAG = 5;
    var MAX_HASHTAG_LENGTH = 20;
    var LIMIT_CHARACTERS_IN_DESCRIPTION = 140;
    var NOTICE_FOR_DESCRIPTION = 'количество символов не больше ' + LIMIT_CHARACTERS_IN_DESCRIPTION;
    var template = document.querySelector(window.library.selector.template.self);
    var templateNotice = template.content.querySelector(window.library.selector.template.errorNotice.self);
    var inputHashTagValidity = true;
    var inputDescriptionValidity = true;
    var timerId;
    var validityErrorNameToInputHashTagCheckInstrument = {
        NOT_SHARP_BEGIN: {
            notice: 'хештег должен начинать с символа #',
            checkFunction: function (hashtags) {
                return hashtags.some(function (hashtag) {
                    return hashtag[0] !== '#';
                });
            }
        },
        ONLY_ONE_SHARP_USED: {
            notice: 'хештег не может состоять только из символа #',
            checkFunction: function (hashtags) {
                return hashtags.some(function (hashtag) {
                    return hashtag.length == 1;
                });
            }
        },
        NO_SPACE_USED: {
            notice: 'хештеги должны разделяться пробелом',
            checkFunction: function (hashtags) {
                return hashtags.some(function (hashtag) {
                    return hashtag.split('#').length > 2;
                });
            }
        },
        HASHTAG_REPEATED: {
            notice: 'хештеги не должны повторяться',
            checkFunction : function (hashtags) {
                return hashtags.some(function (hashtag){
                    var tempArray = hashtags.filter(function (element) {
                        return element === hashtag;
                    });
                    return tempArray.length > 1;
                });
            }
        },
        HASHTAG_LIMIT_INCREASED: {
            notice: 'количество хештегов не должно быть больше ' + QUANTITY_HASHTAG,
            checkFunction: function (hashtags) {
                return hashtags.length > QUANTITY_HASHTAG;
            }
        },
        HASHTAG_LENGTH_INCREASED: {
            notice: 'длина хештега не должна превышать ' + MAX_HASHTAG_LENGTH + ' символов',
            checkFunction: function (hashtags) {
                return hashtags.some(function (hashtag) {
                    return hashtag.length > 20;
                });
            }
        }
    };

    var elementInputHashTags = document.querySelector(window.library.selector.input.hashTag);
    var elementInputDescription = document.querySelector(window.library.selector.input.description);

    var flushAllNotices = function () {
        var elementsNotices = document.querySelectorAll(window.library.selector.template.errorNotice.self);
        Array.prototype.forEach.call(elementsNotices, function (elementNotice) {
            elementNotice.remove();
        });
        elementInputDescription.classList.remove(INVALID_INPUT_CLASSNAME);
        elementInputHashTags.classList.remove(INVALID_INPUT_CLASSNAME);
    };
    var embedNotice = function (elementInput, noticeNode) {
        if(elementInput.classList[0] === 'text__hashtags') {
            var element = document.querySelector('.text__description');
            elementInput.parentElement.insertBefore(noticeNode, element);
        }
        if(elementInput.classList[0] === 'text__description') {
            elementInput.parentElement.appendChild(noticeNode);
        }
    };
    var setNotice = function (elementInput, notice) {
        elementInput.classList.add(INVALID_INPUT_CLASSNAME);
        var elementNotice = templateNotice.cloneNode(true);
        elementNotice.querySelector(window.library.selector.template.errorNotice.text);
        elementNotice.textContent = notice;
        embedNotice(elementInput, elementNotice);
    };

    var validateInputHashTags = function () {
        var notice = '';
        var hashtags = elementInputHashTags.value.split(' ').filter(function (hashtag) {
            return hashtag !== '';
        });
        if(hashtags.length == 1 && hashtags[0] === '') {
            return notice;
        }
        Object.keys(validityErrorNameToInputHashTagCheckInstrument).some(function (key) {
            if(validityErrorNameToInputHashTagCheckInstrument[key].checkFunction(hashtags)) {
                notice = validityErrorNameToInputHashTagCheckInstrument[key].notice;
                return true;
            }
            return false;
        });
        return notice;
    };
    var validateInputDescription = function () { 
        return elementInputDescription.value.length > LIMIT_CHARACTERS_IN_DESCRIPTION ? NOTICE_FOR_DESCRIPTION : '';
    };

    var isFormValidity = function () {
        return inputHashTagValidity && inputDescriptionValidity;
    };
    var prepareFormValue = function () {
        elementInputHashTags.value = window.library.prepareTextValueForSend(elementInputHashTags.value);
        elementInputDescription.value = window.library.prepareTextValueForSend(elementInputDescription.value);
    };
    var onSubmit = function (evt) {
        evt.preventDefault();
        if(isFormValidity()) {
            sendPicture();
            prepareFormValue();
            var event = new Event('form-send');
            document.dispatchEvent(event);
        }
    };
    var sendPicture = function () {
        window.backend.sendPicture(window.networkHandler.onImageSend, window.networkHandler.onImageSendError);
    };

    var onFocus = function () {
        var event = new Event('focus happend');
        document.dispatchEvent(event);
    };
    var flushNotice = function (elementInput) {
        var potentialNoticeNode = elementInput.nextElementSibling;
        if(potentialNoticeNode !== null && potentialNoticeNode.id === 'notice') {
            potentialNoticeNode.remove();
            elementInput.classList.remove(INVALID_INPUT_CLASSNAME);
        }
    };
    var validateFormElement = function (element, elementClassName) {
        if(elementClassName === 'text__description') {
            var notice = validateInputDescription();
            if(notice !== '') {
                inputDescriptionValidity = false;
                setNotice(element, notice);
            } else {
                inputDescriptionValidity = true;
            }
        }
        if(elementClassName === 'text__hashtags') {
            var notice = validateInputHashTags();
            if(notice !== '') {
                inputHashTagValidity = false;
                setNotice(element, notice);
            } else {
                inputHashTagValidity = true;
            }
        }
    };

    var onBlur = function () {
        var event = new Event('blur happend');
        document.dispatchEvent(event);
    };
    var onChanged = function (evt) {
        clearTimeout(timerId);
        setTimeout(function () {
            if(evt.target.classList[0] === 'text__hashtags') {
                flushNotice(evt.target);
                validateFormElement(evt.target, 'text__hashtags');
            }
            if(evt.target.classList[0] === 'text__description') {
                flushNotice(evt.target);
                validateFormElement(evt.target, 'text__description');
            }
        }, 500);
    };

    window.library.addListenerTo(window.library.selector.input.description, 'focus', onFocus);
    window.library.addListenerTo(window.library.selector.input.description, 'blur', onBlur);
    window.library.addListenerTo(window.library.selector.input.description, 'input', onChanged);
    window.library.addListenerTo(window.library.selector.input.hashTag, 'input', onChanged);
    window.library.addListenerTo(window.library.selector.postForm, 'submit', onSubmit);
})();