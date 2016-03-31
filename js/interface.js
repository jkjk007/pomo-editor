/* globals _, POMOEdit, pomoeditorL10n, alert, confirm */
jQuery( function( $ ) {
	var $filters = {
		type: $( '#filter_by_type' ),
		slug: $( '#filter_by_package' ),
		lang: $( '#filter_by_language' )
	};

	$( '#pomoeditor_translations' ).on( 'click', '.pme-source .pme-input[readonly]', function() {
		alert( pomoeditorL10n.SourceEditingNotice );
	} );
	$( '#pomoeditor_translations' ).on( 'click', '.pme-context .pme-input[readonly]', function() {
		alert( pomoeditorL10n.ContextEditingNotice );
	} );

	$( '#pomoeditor_advanced' ).click( function() {
		if ( POMOEdit.advanced ) {
			return;
		}

		if ( ! confirm( pomoeditorL10n.ConfirmAdvancedEditing ) ) {
			return;
		}

		POMOEdit.advanced = true;
		$( this ).addClass( 'active' );
		$( '.pme-input' ).attr( 'readonly', false );
		$( 'body' ).addClass( 'pomoeditor-advanced-mode' );
	} );

	$( '.pomoeditor-filter' ).change( function() {
		var filter = {
			type: $filters.type.val(),
			slug: $filters.slug.val(),
			lang: $filters.lang.val()
		};

		var visible = {
			type: [],
			slug: [],
			lang: []
		};

		_( POMOEdit.List.children ).each( function( view ) {
			view.$el.show();

			var type = view.model.get( 'pkginfo' ).type,
				slug = view.model.get( 'pkginfo' ).slug,
				lang = view.model.get( 'language' ).code;

			if ( filter.type && type !== filter.type ){
				view.$el.hide();
				return;
			}

			if ( filter.slug && slug !== filter.slug ){
				view.$el.hide();
				return;
			}

			if ( filter.lang && lang !== filter.lang ){
				view.$el.hide();
				return;
			}

			visible.type.push( type );
			visible.slug.push( slug );
			visible.lang.push( lang );
		} );

		visible.type = _( visible.type ).uniq();
		visible.slug = _( visible.slug ).uniq();
		visible.lang = _( visible.lang ).uniq();

		_( $filters ).each( function( $filter, key ) {
			$filter.find( 'option' ).show();
			if ( ! filter[ key ] ) {
				$filter.find( 'option[value!=""]' ).each( function() {
					if ( _( visible[ key ] ).indexOf( $( this ).attr( 'value' ) ) === -1 ) {
						$( this ).hide();
					}
				} );
			}
		} );
	} );

	$( '#pomoeditor' ).submit( function( e ) {
		if ( $( '.pme-translation.changed' ).length > 0 ) {
			if ( ! confirm( pomoeditorL10n.ConfirmSave ) ) {
				return;
			}
		}

		POMOEdit.Project.Translations.each( function( translation ) {
			translation.view.close( null, true );
		} );

		$( '#submit' ).text( pomoeditorL10n.Saving );

		var Project = POMOEdit.Project;
		var $storage = $('<textarea name="pomoeditor_data"></textarea>').hide().appendTo(this);

		var data = {
			entries: [],
		};

		Project.Translations.each( function( entry ) {
			data.entries.push( entry.attributes );
		} );

		// If in advanced editing mode, include the headers/metadata
		if ( POMOEdit.advanced ) {
			data.headers = {};
			data.metadata = {};

			Project.Headers.each( function( entry ) {
				data.headers[ entry.get( 'name' ) ] = entry.get( 'value' );
			} );

			Project.Metadata.each( function( entry ) {
				data.metadata[ entry.get( 'name' ) ] = entry.get( 'value' );
			} );
		}

		$storage.val( JSON.stringify( data ) );
	} );
} );
