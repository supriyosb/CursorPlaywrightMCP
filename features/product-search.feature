Feature: Product Search
  As a user
  I want to search for products
  So that I can find what I'm looking for

  Scenario: Search for T-Shirts
    Given I am on the home page
    When I search for "T-Shirts"
    Then I should see "Faded Short Sleeve T-shirts" in the search results
    And the search results count should be greater than 0 