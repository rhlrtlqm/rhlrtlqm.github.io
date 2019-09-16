var log = null;
$(function() {
    var console = $('#console');
    log = {
        log: function(x) {
            console.append(x.toString() + '<br>');
        },
        progress_increase: function() {
            console.append('▃');
        },
        clear: function(){
            console.empty();
        }};
});


function fileName(path)
{
    return path.substring(path.lastIndexOf('/') + 1);
}


var imgPattern = /^.*\.(?:jpg|jpeg|png|gif|webp)$/i;
function addDownloadLink(path, blob)
{
    var blobURL = URL.createObjectURL(blob);
    var linkAnchor = $('<a/>', {
        href: blobURL,
        text: path,
        download: fileName(path)
    });

    if(imgPattern.test(path))
    {
        var imageview = linkAnchor.clone();


        $('<br>').prependTo(imageview);
        $('<img/>', {
            src: blobURL,
            alt: fileName(path),
            'class': 'img-preview'
        }).prependTo(imageview);

        imageview.appendTo('#imagearea');
    }

    linkAnchor.appendTo('#downarea');
}


var unzippedFiles = [];

$(function() {
    $('#down-all').on('click', function(e) {
        unzippedFiles.forEach(function(file) {
            saveAs(file.blob, file.name);
        });
    });

    $('#down-img').on('click', function(e) {
        unzippedFiles.forEach(function(file) {
            if(imgPattern.test(file.name))
            {
                saveAs(file.blob, file.name);
            }
        });
    });
});



function upzipFiles(file)
{
    log.clear();
    $('#down-buttons').hide();
    $('.down-result').hide();
    $('#imagearea').empty();
    $('#downarea').empty();

    JSZip.loadAsync(file).then(function(zip) {
        log.log('압축 해제된 파일: ' + file.name);
        log.log('');
        $('.down-result').show();

        unzippedFiles = [];
        zip.forEach(function(path, entry) {
            if(entry.dir)
            {
                return;
            }

            entry.async('blob').then(function(blob) {
                addDownloadLink(path, blob);

                unzippedFiles.push({
                    name: fileName(path),
                    blob: blob
                });
            });
        });

        $('#down-buttons').show();
    }, function(e) {
        log.log('파일 \''+file.name+'\'은(는) zip 압축파일이 아님');
        log.log('이미지가 손상됐거나, 원본받기 안 한 것 같음');
        log.log('아니면 사실 전통방식이 아니었을 수도 있고');
    });
}


window.addEventListener('dragover', function(e) {
    e.preventDefault();
}, false);

window.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();

    upzipFiles(e.dataTransfer.files[0]);
}, false);

$(function(){
    $('#fileform').on('change', function(e) {
        upzipFiles(this.files[0]);
    });
});
