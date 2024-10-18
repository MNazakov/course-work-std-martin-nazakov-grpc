package com.taskrr.repository;

import com.taskrr.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByBoardId(Integer boardId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Task t WHERE t.board.id = :boardId")
    void deleteByBoardId(int boardId);
}