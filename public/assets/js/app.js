//Handle Scrape button
$("#scrape").on("click", function() {
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).then(function(data) {
    window.location = "/";
  });
});

//Set clicked nav option to active
$(".navbar-nav li").click(function() {
  $(".navbar-nav li").removeClass("active");
  $(this).addClass("active");
});

//Handle Save Article button
$(".save").on("click", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/save/" + thisId
  }).then(function(data) {
    window.location = "/";
  });
});

//Handle Delete Article button
$(".delete").on("click", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/delete/" + thisId
  }).then(function(data) {
    window.location = "/saved";
  });
});

//Handle Save Note button
$(".saveNote").on("click", function() {
  var thisId = $(this).attr("data-id");
  if (!$("#noteText" + thisId).val()) {
    alert("please enter a note to save");
  } else {
    $.ajax({
      method: "POST",
      url: "/notes/save/" + thisId,
      data: {
        text: $("#noteText" + thisId).val()
      }
    }).then(function(data) {
      // Empty the notes section
      $("#noteText" + thisId).val("");
      $(".modalNote").modal("hide");
      window.location = "/saved";
    });
  }
});

//Handle Delete Note button
$(".deleteNote").on("click", function() {
  var noteId = $(this).attr("data-note-id");
  var articleId = $(this).attr("data-article-id");
  $.ajax({
    method: "DELETE",
    url: "/notes/delete/" + noteId + "/" + articleId
  }).then(function(data) {
    $(".modalNote").modal("hide");
    window.location = "/saved";
  });
});
