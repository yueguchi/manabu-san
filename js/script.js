$(function() {
    $(".loading").hide();
    // chat送信
    /**
     * エンターキーでsubmitさせる
     */
    $("#chat-text").keydown(function(e) {
        // エンターキーはchatのトリガーにする
        if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
            // キーボードの出っ放しを防ぐため、focusを外す
            $(this).blur();
            $(".chat-icon").trigger("click");
        }
    });
    $(".chat-icon").on("click", function() {
        if ($("#chat-text").val().length > 0) {
            var postMessage = $("#chat-text").val();
            // copy
            var appendArrowbox = $(".chat-example > .arrow_box_right.copy").clone().removeClass("hidden copy").text(postMessage);
            $(".chat-example").append(appendArrowbox);
            $("#chat-text").val("");
            // 画面操作を無効する
            $(".loading").show();
            lockScreen("doing-ajax");
            $.ajax({
                    url: $(".chat-example").attr("data-repl-url"),
                    type: 'GET',
                    data: {
                        words: postMessage,
                    },
                    dataType: 'json'
                })
                .done(function(data, textStatus, jqXHR) {
                    var appendArrowbox = $(".chat-example > .arrow_box_left.copy").clone().removeClass("hidden copy").text(data.result.chat);
                    $(".chat-example").append(appendArrowbox);
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    // error
                })
                .always(function(jqXHR, textStatus) {
                    $(".loading").hide();
                    $('.chat-example').animate({scrollTop: $('.chat-example')[0].scrollHeight}, 'fast');
                    unlockScreen("doing-ajax");
                });
        }
    });

    /*
     * 画面操作を無効にする
     */
    function lockScreen(id) {
        var divTag = $('<div />').attr("id", id);
        divTag.css("z-index", "999")
              .css("position", "absolute")
              .css("top", "0px")
              .css("left", "0px")
              .css("right", "0px")
              .css("bottom", "0px")
              .css("background-color", "gray")
              .css("opacity", "0.8");
        $('body').append(divTag);
    }

    /*
     * 画面操作無効を解除する
     */
    function unlockScreen(id) {
        $("#" + id).remove();
    }
});
