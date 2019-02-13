Meteor.startup(function () {
	
  $.ajaxSetup({ cache: true });
	Meteor.setTimeout(function(){
		loadScripts();
	},10000);
	

}); 

export const loadScripts = function (){
	//return console.log('FIXX');
	$.ajaxSetup({ cache: true });
	
	//FB api
	if (!window.FB) 
		Meteor.setTimeout(function(){
			$.ajax({
				url: '//connect.facebook.net/en_US/sdk.js',
				dataType: 'script',
				cache: true,
				success:function(script, textStatus, jqXHR){
					if (!window.FB)
						return Bert.alert('You have blocked FB, some features will not be working properly', 'danger');
					if (Meteor.settings.public.facebook)
						FB.init(Meteor.settings.public.facebook);
					else 
						return console.warn('ajaxscripts FB is not configured');
					 
					$('#loginbutton,#feedbutton,.fb-share').removeAttr('disabled');
					
					FB.getLoginStatus(function(err,res){
						if (Session.get('debug')) console.log('fb', err, res);
					});
					if (FB.AppEvents)
						FB.AppEvents.logPageView();
					console.log('FB loaded');
				},
				error:function(err){
					console.warn('FB load err:', err)
				}
			});
		},2000);
		
		//summernote
		$.ajax({
			url: '//cdnjs.cloudflare.com/ajax/libs/summernote/0.8.11/summernote-bs4.js',
			dataType: 'script',
			cache: true,
			success:function(script, textStatus, jqXHR){
				console.log('summernote loaded');
			},
			error:function(err){
				console.warn('summernote load err:', err)
			}
		});
		
		//sharing btns
/* 		$.ajax({
			url: '//cdn.jsdelivr.net/socialmedia.js/latest/SocialMedia.min.js',
			dataType: 'script',
			cache: true,
			success:function(script, textStatus, jqXHR){
				console.log('SocialMedia loaded');
				console.log('SocialMedia', SocialMedia);
			},
			error:function(err){
				console.warn('SocialMedia load err:', err)
			}
		}); */

		
}
