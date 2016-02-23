// Global Variables
var isRunning = true;
var container;
var camera, scene, renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var currentTime = 6200; // 60sec
// var currentTime = 60000; //10 mins
var RenderTime = 0;
var shouldExpand = true;
var heartModel;
var $loadingText = $("div#loading").find("h1");
var $loadingScreen = $("div#loading");
var textureC;
var video, videoImage, videoImageContext, videoTexture;

//WebGL
    function init() {
        container = document.createElement( 'div' );
        document.body.appendChild( container );

        // setup Camera, Scene, Light
            camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
                camera.position.z = 200;
                camera.target = new THREE.Vector3(0,0,0);

            scene = new THREE.Scene();

            var ambient = new THREE.AmbientLight( 0x101030 );
                scene.add( ambient );

            var directionalLight = new THREE.DirectionalLight( 0xffeedd );
                directionalLight.position.set( 0, 0, 1 );
                scene.add( directionalLight );

        // // Video Element as Texture
            textureC = new THREE.VideoTexture(video3);
                textureC.minFilter = THREE.LinearFilter;
                textureC.magFilter = THREE.LinearFilter;
                textureC.format = THREE.RGBFormat;
                textureC.needsUpdate = true;

        //WebCam Texture
            video = document.getElementById( 'monitor' );
            videoImage = document.getElementById( 'videoImage' );
            videoImageContext = videoImage.getContext( '2d' );
            // background color if no video present
            videoImageContext.fillStyle = '#000000';
            videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
            videoTexture = new THREE.Texture( videoImage );
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;

        //Sphere Geometry
            // var material = new THREE.MeshBasicMaterial( parameters );

            // var geometry = new THREE.BoxGeometry(50,50,50);
            // var cube = new THREE.Mesh(geometry, material);
            // scene.add(cube);
        
        //Sphere 1
            var parameters = {
                color:0xffffff, 
                map:textureC
                // map:videoTexture
                , wireframe:true
                };

            var geometry = new THREE.SphereGeometry(300, 100, 100);
                // var geometry = new THREE.PlaneGeometry(1000,1000);
                geometry.scale( - 1, 1, 1 );

            var material = new THREE.MeshBasicMaterial( parameters );
                material.map.needsUpdate = true;
                // var material = new THREE.MeshNormalMaterial( parameters );
                // var material = new THREE.MeshPhongMaterial( parameters );
                // var material = new THREE.MeshLambertMaterial( parameters );
            var sphere = new THREE.Mesh(geometry, material);
                scene.add(sphere);
                sphere.position.z = 100; // sphere
                // sphere.position.z = -100; // plane
        //Sphere 2
            var parameters2 = {
                color:0xffffff, 
                map:textureC
                // map:videoTexture
                // , wireframe:true
                };
            var material2 = new THREE.MeshBasicMaterial(parameters2);
            material2.needsUpdate = true;
            var geometry2 = new THREE.SphereGeometry(500, 100, 100);
                geometry2.scale( - 1, 1, 1 );
            var sphere2 = new THREE.Mesh(geometry2, material2);
            scene.add(sphere2);
                sphere2.position.z = 100; // sphere

        // Manager
            var manager = new THREE.LoadingManager();
            manager.onProgress = function ( item, loaded, total ) {
                // console.log( item, loaded, total );
            };

            var onProgress = function ( xhr ) {
                if ( xhr.lengthComputable ) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    $loadingText.html(Math.round(percentComplete, 2) + '%' );

                    if(percentComplete >= 100){
                        $loadingScreen.delay(3000).fadeOut(2000);
                    }
                }
            };

            var onError = function ( xhr ) {
                $("#loading").append($("<h1>This microsite requires WebGL support. Please come back again with other devices.</h1>"))
            };

        // Setup Image Loader for texture
            // var loader = new THREE.ImageLoader( manager );
            // loader.load( 'img/marble-5_transparent.png', function ( image ) {
            //     texture.image = image;
            //     texture.needsUpdate = true;
            // } );

        // Setup OBJ Loader
        var loader = new THREE.OBJLoader( manager );

        // Load Heart Model
        loader.load( 'Heart/Heart.obj', function ( object ) {

            heartModel = object;
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    // child.material.map = textureD;
                    child.material.map = videoTexture;
                    child.material.map.needsUpdate = true;
                    // child.material.wireframe = true;
                    // child.material.envMap = reflection;
                }
            } );
            scene.add( heartModel );
        }, onProgress, onError );

        //setup Renderer
            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            container.appendChild( renderer.domElement );

        //document EventListener
            document.addEventListener( 'mousemove', onDocumentMouseMove, false );
            window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function onDocumentMouseMove( event ) {
        mouseX = ( event.clientX - windowHalfX ) / 2;
        mouseY = ( event.clientY - windowHalfY - 200) / 2;
    }

    function pulseAnimation(){
        if(RenderTime > 50 && isRunning){
            if(shouldExpand){
                heartModel.scale.x += 0.003;
                heartModel.scale.y += 0.003;
                heartModel.scale.z += 0.003;
                // if(heartModel.scale.x > 5.1){
                if(heartModel.scale.x > 1.1 - currentTime * 0.00001){
                    shouldExpand = false;
                }
            }
            else{
                heartModel.scale.x -= 0.0035;
                heartModel.scale.y -= 0.0035;
                heartModel.scale.z -= 0.0035;
                if(heartModel.scale.x < 1  - currentTime * 0.00001){
                    shouldExpand = true;
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame( animate );
        render();
    }

    function render() {
        RenderTime++;
        camera.position.x += ( mouseX  - camera.position.x) * .01;
        camera.position.y += ( - mouseY - camera.position.y) * .03;
        camera.lookAt( scene.position );

        if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
        {
            videoImageContext.drawImage( video, 0, 0, videoImage.width, videoImage.height );
            if ( videoTexture ) 
                videoTexture.needsUpdate = true;
        }

        if(heartModel !== null){
             pulseAnimation(); 
        }

        renderer.render( scene, camera );   
    }
    init();
    animate();

window.onload = (function(){
    $("demo").html('"' + strings[customCount] + '"');

    $("nav ul li a").hover(function(){
        $("nav p").fadeIn("slow");
    }, function(){
        $("nav p").fadeOut("slow");

    });
    //Timer 
    function pad(number, length) {
        var str = '' + number;
        while (str.length < length) {str = '0' + str;}
        return str;
    }
    function formatTime(time) {
        var min = parseInt(time / 6000),
            sec = parseInt(time / 100) - (min * 60),
            hundredths = pad(time - (sec * 100) - (min * 6000), 2);
        return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2) + ":" + hundredths;
    }

    var delayTime = 1500;
    var fadeTime = 1300;
    var customCount = 0;

    var HeartTimer = new (function() {
        var $countdown,
            incrementTime = 70
            updateTimer = function() {
                $countdown.html(formatTime(currentTime));
                if (currentTime == 0) {
                    HeartTimer.Timer.stop();
                    timerComplete();
                    return;
                }
                currentTime -= incrementTime / 10;
                if (currentTime < 0) currentTime = 0;
            },
            timerComplete = function() {
                //Fade In after Timer ends
                $("#demo").fadeOut("fast");
                $("#videooverlay").fadeOut(100);
                $("#end").fadeIn(2000);
                $("canvas").fadeOut(3000);
                $("#sound-heart").trigger('pause');
                $("#headerhidden").fadeIn(2000);
                isRunning = false;
            },
            init = function() {
                $countdown = $('#countdown');
                HeartTimer.Timer = $.timer(updateTimer, incrementTime, true);
            };
            $(init);
    });
    nextQuote = function(){
        if (customCount == 0 && isRunning){
            $("#quotes p").html('"' + strings[customCount] + '"');
            $("#quotes p").delay(10000).fadeIn(fadeTime, function(){
                $(this).delay(5000).fadeOut(fadeTime, function(){
                    customCount++;
                    nextQuote(3500);
                });
            });
        }
        else if (customCount != 0 && customCount != strings.length && isRunning){
            $("#quotes p").html('"' + strings[customCount] + '"');
            $("#quotes p").delay(3500).fadeIn(fadeTime, function(){
                $(this).delay(5000).fadeOut(fadeTime, function(){
                    customCount++;
                    nextQuote(3500);
                });
            });
        }
        else{
            $("#quotes p").fadeOut("fast");
        }
    };
    nextQuote();
    $("#aboutbutton").click(function(){
        $("#about").fadeIn("slow");
    });
    $(".closebutton").click(function(){
        $("#about").fadeOut("slow");
    });
})();