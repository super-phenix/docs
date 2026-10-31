# sfs-baas

Values and chart documentation for `components/dependencies/sfs-baas` in the [Superphenix repository](https://github.com/super-phenix/superphenix). Defaults are the chart defaults.

This Helm Chart is used by the self-service ArgoCDs of Superphenix to create backup policies.

### Resource names

Resources have a unique ID (see [Creating new resources](sfs-iaas.md#creating-new-resources)) and a name.

Names do not have to be unique across resources and can be identical. They are simply used as a tag to be filtered and found more easily.

To set a name on a resource, use the `.name` value.

!!! note
    Names **must** begin with a letter or number, and may contain letters, numbers, hyphens, dots, and underscores, up to 63 characters each.

### Setting a resource location

Resources are located within a specific AZ (or *availability zone*). AZs are represented by a unique code.

To deploy your resource in a specific AZ, simply use the code in the `.location` value of the resource.

---

## Values

<h3>Backups</h3>
<table>
	<thead>
		<th>Key</th>
		<th>Type</th>
		<th>Default</th>
		<th>Description</th>
	</thead>
	<tbody>
		<tr>
			<td>backups</td>
			<td>object</td>
			<td><pre lang="">
{}
</pre>
</td>
			<td>Defines backups to be created. Each key defines a new backup/backup schedule. See values.yaml for the complete syntax.</td>
		</tr>
	</tbody>
</table>
<h3>Organization parameters</h3>
<table>
	<thead>
		<th>Key</th>
		<th>Type</th>
		<th>Default</th>
		<th>Description</th>
	</thead>
	<tbody>
		<tr>
			<td>gitops</td>
			<td>bool</td>
			<td><pre lang="json">
false
</pre>
</td>
			<td>Whether this chart is deployed through GitOps or not. This parameter cannot be overriden by the user.</td>
		</tr>
		<tr>
			<td>location</td>
			<td>string</td>
			<td><pre lang="json">
""
</pre>
</td>
			<td>AZ in which we're deploying this chart. This parameter cannot be overriden by the user.</td>
		</tr>
		<tr>
			<td>organizationID</td>
			<td>string</td>
			<td><pre lang="json">
"00000000-0000-0000-0000-000000000000"
</pre>
</td>
			<td>Superphenix organization to which this project belongs, must be a generated UUIDv4. This ID must come from the SPX API, this parameter cannot be overriden by the user.</td>
		</tr>
		<tr>
			<td>organizationName</td>
			<td>string</td>
			<td><pre lang="json">
"null"
</pre>
</td>
			<td>Superphenix organization's friendly name. This parameter cannot be overriden by the user.</td>
		</tr>
		<tr>
			<td>projectID</td>
			<td>string</td>
			<td><pre lang="json">
"00000000-0000-0000-0000-000000000000"
</pre>
</td>
			<td>Superphenix project to which this project belongs, must be a project within the organization, must be a generated UUIDv4. This ID must come from the SPX API, this parameter cannot be overriden by the user.</td>
		</tr>
		<tr>
			<td>projectName</td>
			<td>string</td>
			<td><pre lang="json">
"null"
</pre>
</td>
			<td>Superphenix project's friendly name. This ID must come from the SPX API, this parameter cannot be overriden by the user.</td>
		</tr>
	</tbody>
</table>
