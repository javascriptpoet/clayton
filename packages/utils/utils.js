myApp={};
myApp.getSummernoteAttr=function getSummernoteAttr() {
    return {
        type: 'summernote',
        class: 'editor', // optional
        settings: {
            onImageUpload: function (files) {
                console.log(files);
                if (files) {
                    _.each(files, function (file) {
                        myApp.fileToFS(
                            {
                                file: file,
                                colObj: Images,
                                storeName: 'images',
                            },
                            function success(fileObj) {
                                var imgNode = $('<img>').attr('src', fileObj.url());
                                $('.editor').summernote('insertNode', imgNode[0]);
                            }
                        )
                    })
                }
            }
        }
    }
};
myApp.FilesToFS =  function (opts, success) {
    var curFile = opts.colObj.find({'original.name': opts.file.name, 'original.size': opts.file.size});
    if (!curFile.count()) {
        opts.colObj.insert(opts.file, function (e, fileObj) {
            if (e) {
                Session.set('errorMsg', e.message)
            } else {
                var id = Meteor.setInterval(function () {
                    if (fileObj.hasStored(opts.storeName)) {
                        Meteor.clearInterval(id);
                        success(fileObj);
                    }
                }, 100);
            }
        })
    } else {
        success(curFile.fetch()[0]);
    }
}
