<div class="result-header">
   <ul>
    <li class="stmt-wrapper left">
      <code><%= this.stmt %></code>
    </li>
    <li class="right">
      <input id="toggle_result_<%= this.id %>" class="result-header-action toggle-result" type="image" title="Show/Hide"
            src="" alt="Show/Hide" width=16 height=16 onclick="toggleResult(<%= this.id %>);" />
    </li>
    <li class="right">
      <input id="export_json_<%= this.id %>" class="result-header-action export-json" type="image" title="Export json"
            src="" alt="Export json" width=16 height=16 onclick="exportJson(<%= this.id %>);" />
    </li>
    <li class="right">
      <input id="export_csv_<%= this.id %>" class="result-header-action export-csv" type="image" title="Export csv"
            src="" alt="Export csv" width=16 height=16 onclick="exportCsv(<%= this.id %>);" />
    </li>
  </ul>
</div>

<script>
  (function() {
    let btnToggleResult = document.getElementById("toggle_result_<%= this.id %>");
    let btnExportJson = document.getElementById("export_json_<%= this.id %>");
    let btnExportCsv = document.getElementById("export_csv_<%= this.id %>");

    if (document.body.className == "vscode-light") {
      btnToggleResult.src = "<%= res('../images/light/eye.svg') %>";
      btnExportJson.src = "<%= res('../images/light/json.svg') %>";
      btnExportCsv.src = "<%= res('../images/light/csv.svg') %>";
    } else {
      btnToggleResult.src = "<%= res('../images/dark/eye.svg') %>";
      btnExportJson.src = "<%= res('../images/dark/json.svg') %>";
      btnExportCsv.src = "<%= res('../images/dark/csv.svg') %>";
    }
  }())
</script>