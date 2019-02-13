import './not-found.html';
//import { FlowRouterSEO } from 'meteor/tomwasd:flow-router-seo';

Template.App_notFound.onCreated( () => {
	$('head').append('<meta name="prerender-status-code" content="404">');
});
Template.App_notFound.onRendered( () => {
	$('#loadingspinner').fadeOut('slow');
	$('#injectloadingspinner').fadeOut();
	$('body').css('overflow', 'auto');
});
