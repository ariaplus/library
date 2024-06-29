// File: Feed.scala

// Define a case class to represent a feed item
case class FeedItem(id: Int, title: String, content: String, author: String, timestamp: Long)

// Define an object with methods to manage feed items
object Feed {

  // A sample list of feed items
  private var feedItems: List[FeedItem] = List(
    FeedItem(1, "First Post", "This is the first post", "Alice", System.currentTimeMillis()),
    FeedItem(2, "Second Post", "This is the second post", "Bob", System.currentTimeMillis())
  )

  // Method to add a new feed item
  def addFeedItem(item: FeedItem): Unit = {
    feedItems = feedItems :+ item
  }

  // Method to get all feed items
  def getAllFeedItems: List[FeedItem] = {
    feedItems
  }

  // Method to get a feed item by ID
  def getFeedItemById(id: Int): Option[FeedItem] = {
    feedItems.find(_.id == id)
  }
}

// A simple main object to test the Feed object
object Main {
  def main(args: Array[String]): Unit = {
    // Print all feed items
    println("All feed items:")
    Feed.getAllFeedItems.foreach(println)

    // Add a new feed item
    val newItem = FeedItem(3, "Third Post", "This is the third post", "Charlie", System.currentTimeMillis())
    Feed.addFeedItem(newItem)

    // Print all feed items after adding the new item
    println("\nAll feed items after adding a new item:")
    Feed.getAllFeedItems.foreach(println)

    // Get and print a specific feed item by ID
    println("\nFeed item with ID 2:")
    println(Feed.getFeedItemById(2).getOrElse("Not found"))
  }
}
