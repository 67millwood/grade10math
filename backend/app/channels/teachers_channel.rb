class TeachersChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"
    stream_from "teachers_channel"
  end

  def who_is_online
  end

  def student_answer
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
