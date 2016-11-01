var RegistryFlatMain= React.createClass({
	

	render:function(){
		var serverUrl = this.props.url;

		return(<div>
				<RegistryListFlatView />
			</div>);
	}
});



var RegistryListFlatView= React.createClass({

render:function(){
	return(<div>
	<h3>Component Example</h3>
	<ResultCount />
	<p>Place plain html here for flat view mockup... Once we have a static html representation of the flat view here. we can
	The view should be a tabular representation of every registry entry . Please include links for creating/updating/deleting records. they do not have to contain actual click through yet.
	</p>
	
	<h3>for example</h3>
	<table class="tbl" border="1" width="50%">
	<thead>
	<th>category</th>
	<th>name</th>
	<th>value</th>
	</thead>
	<tbody>
	<tr><td>some category</td><td>some name</td><td>some value</td></tr>
	<tr><td>some category</td><td>some name</td><td>some value</td></tr>
	<tr><td>some category</td><td>some name</td><td>some value</td></tr>
	<tr><td>some category</td><td>some name</td><td>some value</td></tr>
	</tbody></table>
	
	</div>);
}
});

