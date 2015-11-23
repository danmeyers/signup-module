$(document).ready(function() {

    // Clicking anywhere in box focuses the editable div
    $(".cell_title").click(function(event) {
        $(this).siblings('.cell_input').focus();
    });

    var reg = {
        fontSize: "16px",
        lineHeight: "70px"
    };

    var small= {
        fontSize: "12px",
        lineHeight: "22px",
    };
    
    // Whenever text changes
    $(".cell_input").on("input", function(event) {
        
        var text = $(this).text() || $(this).val();
        var default_text = $(this).siblings('.cell_title');
        
        // Move the title of the box if necessary
        if (text && default_text.css("font-size") === "16px") {
            default_text.animate(small, 200);
            default_text.css("font-weight", "normal");
        } else if (!text){
            default_text.animate(reg, 200);
            default_text.css("font-weight", "inherit");
        }
        
        // Resize font
        $(this).resizeFont(10, 20);
        
        // Remove error text if it is required text
        if ($(this).parent().children('.errorText').text() === 'Required.') {
            $(this).parent().children('.errorText').remove();
        }
    
        // Validate everything
        $(".cell_input").each(function(){ $(this).validate()});
        
        countProgressBar();
    });

    // Resize font on window resize
    window.onresize = function() {
        $('.cell_input').resizeFont(10, 20);
    };
    
    // On focus
    $(".cell_input").focus(function(event) {
        //Highlight text on focus
        setTimeout( function () {
            document.execCommand("selectAll", false, null);
        }, 0);
         
        // Add focus look
        $(this).parent().addClass("focused");
    });

    // On focus out
    $(".cell_input").focusout(function(event) {
        // Remove focus look
        $(this).parent().removeClass("focused");
           
        // Validate everything
        $(".cell_input").each(function(){ $(this).validate()});
    });

    // When email is entered, activate the second, verify email box
    $("#email1 .cell_input").on("input", function(event) {
        var text = $(this).text();
        var email2 = $("#email2");
        if (text && email2.hasClass("inactive")) {
            email2.activate();

        } else if (!text && !email2.hasClass("inactive")) {
            email2.inactivate();

        }
    });
    
    // When password is entered, activate the second, verify password box
    $("#pword1 .cell_input").on("input", function(event) {
        var text = $(this).val();
        var pword2 = $("#pword2");
        if (text && pword2.hasClass("inactive")) {
            pword2.activate();

        } else if (!text && !pword2.hasClass("inactive")) {
            pword2.inactivate();

        }
    });
    
    // When submit is clicked, identify unvalidated boxes or submit if there are none
    $(".row.submit").click(function(event) {
        var valid = $(".cell.validated");
        var notValid = $(".cell:not(.validated):not(#submit)");
        if (notValid.size() > 0) {
            notValid.each(function(){ $(this).todo()});
        } else {
            submit();
        }
    });
        
});


// Show submission results on screen (it would actually send this off it were real)
function submit() {
    $("#results").show();
    $("#res_fn").text($("#first_name .cell_input").text());
    $("#res_ln").text($("#last_name .cell_input").text());
    $("#res_uid").text($("#user_id .cell_input").text());
    $("#res_email").text($("#email1 .cell_input").text());
    $("#res_pword").text($("#pword1 .cell_input").val());
}

// Update progress bar to show how many boxes left to fill in with valid info
function countProgressBar() {
    function setPercent(newPercent) {
        $(".row  #submit.cell").css("background","linear-gradient(to right, #4da5ff " + newPercent + "%, #fff " + newPercent + "%)");
    }
    
    // Get validated boxes
    var valid = $(".cell.validated");
    
    // Determine percentage done
    var newPercentage = Math.round((100 / 7) * valid.size());
    var oldPercentage = parseInt($(".row  #submit.cell").css("background").match(/(\d+)%/)[0]);

    // Update progress bar
    setPercent(newPercentage);
}

// Set color and text for element still todo (when submit clicked but not all done)
$.fn.todo = function() {
    $(this).addClass("todo");
    
    if ($(this).children('.errorText').size() > 0) {
        return;
    }
    
    $(this).errorText("Required.");
}

// Activate a box
$.fn.activate = function() {
    $(this).removeClass("inactive");
}

// Deactivate a box
$.fn.inactivate = function() {
    $(this).addClass("inactive");
    $(this).children('.cell_input').text("");
    $(this).children('.cell_input').val("");
}

// Validate a box's info
// Make a new conditional for user id if that needs to be checked against master list
$.fn.validate = function() {
    var parent = $(this).parent();
    
    // Remove invalidity and validity
    parent.removeClass('validated');
    parent.removeClass('not_valid');
    if (parent.children('.errorText').text() !== 'Required.') {
        parent.children('.errorText').remove();
    }
    
    // Email checker
    if (parent.hasClass("validate_email")) {
        
        // Check sameness in email 1 vs. email 2
        if (parent.attr('id') === 'email2') {
            var email1_text = $('#email1').children('.cell_input').text().toLowerCase();
            if (email1_text !== $(this).text().toLowerCase()) {
                parent.addClass("not_valid");
                parent.errorText("Emails do not match!");
                return;
            }
        }
        
        // Valid format
        if ($(this).text() && !/\S+@\S+\.\S+/.test($(this).text())) {
            parent.addClass("not_valid");
            parent.errorText("Not valid email!");
            return;
        }

    }
    
    // Password checker
    if (parent.hasClass("validate_pword")) {
        
        // Check sameness in password 1 vs. password 2
        if (parent.attr('id') === 'pword2') {
            var pword1_text = $('#pword1').children('.cell_input').val();
            if (pword1_text !== $(this).val()) {
                parent.addClass("not_valid");
                parent.errorText("Passwords do not match!");
                return;
            }
        }
        
        // Make a valid password format, if you want.
        /*
        if ($(this).val() && !/\S+@\S+\.\S+/.test($(this).val())) {
            parent.addClass("not_valid");
            parent.errorText("Not valid password!");
            return;
        }
        */
    }

    
   // If there is no text, there is no validity or invalidity
    if (!($(this).text() || $(this).val())) {
        return;
    }
    
    // Anything else that has any text is valid
    parent.addClass("validated");
}

// Add error text to this box
$.fn.errorText = function(str) {
    $(this).prepend("<span class='errorText'>" + str + "</span>"); 
}

// Resize the font to fit in the box
$.fn.resizeFont = function(min, max) {
    while (!$(this).HasScrollBar()) {
        if (increaseFontSize($(this), max)) {
            break;
        }
    }
    
    while ($(this).HasScrollBar()) {
        if (decreaseFontSize($(this), min)) {
            break;
        }
    }
}

// HELPERS USED BY RESIZE FONT

function increaseFontSize(elt, max) {
    fs = elt.css("font-size");
    fontSize = parseInt(fs);
    
    if (fontSize < max) {
         elt.css("font-size", fontSize + 1);
         return false;
    }
    
    return true;
}

function decreaseFontSize(elt, min) { 
    fs = elt.css("font-size");
    fontSize = parseInt(fs);
    
    if (fontSize > min) {
         elt.css("font-size", fontSize - 1);
         return false;
    }
    
    return true;
}

$.fn.HasScrollBar = function() {
    //note: clientHeight= height of holder
    //scrollHeight= we have content till this height
    var _elm = $(this)[0];
    var _hasScrollBar = false; 
    if ((_elm.clientWidth < _elm.scrollWidth)) {
        _hasScrollBar = true;
    }
    return _hasScrollBar;
}