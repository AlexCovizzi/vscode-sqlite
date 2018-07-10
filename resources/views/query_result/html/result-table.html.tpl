<div id="result_table_<%= this.id %>" class="result-table">
  <% if (this.rows.length !== 0) { %>
    <table class="enumerated">
        <tr>
            <th>#</th>
            <% for (h of this.header) { %>
              <th><%= h %></th>
            <% } %>
        </tr>
        <% for (row of this.rows) { %>
          <tr>
            <td></td>
            <% for (r of row) { %>
                <td><%= r %></td>
            <% } %>
          </tr>
        <% } %>
    </table>
  <% } else { %>
    <table class="no-result">
      <td>No result found</td>
    </table>
  <% } %>
</div>