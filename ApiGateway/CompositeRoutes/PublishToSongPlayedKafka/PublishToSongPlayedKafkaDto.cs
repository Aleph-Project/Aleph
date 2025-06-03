public class SongPlayedEventDto
{
    public string Event { get; set; }
    public string User_Id { get; set; }
    public string Song_Id { get; set; }
    public DateTime Played_At { get; set; }
    public int? Duration_Played { get; set; }
}